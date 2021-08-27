fn(state => {
  const json = state.data.json.filter(x => x.DDId);
  return { ...state, data: { ...state.data, json } };
});

fn(state => {
  const formatDate = date => {
    if (!date) return null;
    date = date.split(' ')[0];
    const parts = date.match(/(\d+)/g);
    const year = String(parts[2]).length > 2 ? parts[2] : `20${parts[2]}`;
    return parts ? new Date(Number(year), parts[1] - 1, parts[0]).toISOString() : parts;
  };

  const selectAmount = item => {
    if (item.Amount) {
      return isNaN(item.Amount) ? item.Amount.replace(/[^-.0-9]/g, '') : parseInt(item.Amount);
    }
    return undefined;
  };

  const selectIDs = state.data.json.map(x => `${x.PrimKey}${x.DDId}`);

  return {
    ...state,
    selectIDs,
    formatDate,
    selectAmount,
  };
});

query(
  state => `Select Id, CloseDate, npe03__Recurring_Donation__r.Committed_Giving_ID__c FROM Opportunity
  WHERE npe03__Recurring_Donation__r.Committed_Giving_ID__c in
  ('${state.selectIDs.join("', '")}')`
);

fn(state => {
  const { records } = state.references[0];
  const SFMonth = records.map(rec => rec.CloseDate.split('-')[1]);
  const SFYear = records.map(rec => rec.CloseDate.split('-')[0]);
  const SFRecurringDonationIds = records.map(rec => rec.npe03__Recurring_Donation__r);
  const Ids = records.map(rec => rec.Id);

  const selectGivingId = x => `${x.PrimKey}${x.DDId}${x.DDRefforBank}${x.Date}`;

  const baseMapping = x => {
    return {
      Id: x.Id,
      Committed_Giving_ID__c: selectGivingId(x),
      'npsp__Primary_Contact__r.Committed_Giving_ID__c': `${x.PrimKey}`,
      'Account.Committed_Giving_ID__c': `${x.PrimKey}`,
      Amount: state.selectAmount(x),
      CurrencyIsoCode: 'GBP',
      StageName: 'Closed Won',
      CloseDate: state.formatDate(x['Date']),
      Transaction_Date_Time__c: state.formatDate(x['Date']),
      npsp__Closed_Lost_Reason__c: x['Unpaid reason'], //Map from DirectDebit?
      'Campaign.Source_Code__c': x['PromoCode'],
      Name: x.DDRefforBank,
      Donation_Type__c: x['TransType'] === 'Sponsorship' ? 'Sponsorship' : 'Recurring Donation',
      Payment_Type__c: state.selectAmount(x) > 0 ? 'Payment' : 'Refund', //REFUND IF negative amount
      'npe03__Recurring_Donation__r.Committed_Giving_ID__c': `${x.PrimKey}${x.DDId}`,
      Method_of_Payment__c: 'Debit',
    };
  };

  const opportunitiesToUpdate = state.data.json
    // .filter(o => state.selectIDs.includes(`${o.PrimKey}${o.DDId}`))
    .map(o => {
      let match = null;
      const date = o.Date.split(' ')[0];
      let csvMonth = date.split('/')[1];
      csvMonth = csvMonth.length < 2 ? `0${csvMonth}` : csvMonth;
      const csvYear = date.split('/')[2];
      const csvRecurringDonationId = `${o.PrimKey}${o.DDId}`; // Building Id of current csv donation

      // for each month for salesforce records
      SFMonth.forEach((month, i) => {
        // if that month matches one with a csv row...
        if (month === csvMonth) {
          //...and the year of that month matches the year of that same csv row
          if (SFYear[i] === csvYear) {
            // ... and the recurring donation ID of that SF records matches the csv donation ID
            if (
              SFRecurringDonationIds[i] &&
              SFRecurringDonationIds[i].Committed_Giving_ID__c === csvRecurringDonationId
            ) {
              match = { ...o, Id: Ids[i] };
            }
          }
        }
      });
      return match;
    })
    .map(x => {
      return {
        ...baseMapping(x),
      };
    });

  const opportunitiesToUpdateIDs = opportunitiesToUpdate.map(o => o.Committed_Giving_ID__c);

  const opportunitiesToCreate = state.data.json
    .filter(o => !opportunitiesToUpdateIDs.includes(selectGivingId(o)))
    .map(x => {
      return {
        ...baseMapping(x),
      };
    });

  console.log('Count of "To create" opportunities:', opportunitiesToCreate.length);
  console.log('Count of "To update" opportunities:', opportunitiesToUpdate.length);

  return { ...state, opportunitiesToUpdate, opportunitiesToCreate };
});

bulk(
  'Opportunity',
  'update',
  {
    extIdField: 'Id',
    failOnError: true,
    allowNoOp: true,
  },
  state => state.opportunitiesToUpdate
);

bulk(
  'Opportunity',
  'upsert',
  {
    extIdField: 'Id',
    failOnError: true,
    allowNoOp: true,
  },
  state => state.opportunitiesToCreate
);

alterState(state => {
  // lighten state
  return { ...state, opportunitiesToCreate: [], opportunitiesToUpdate: [], selectIDs: [] };
});
