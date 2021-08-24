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
  state => `Select Id, CloseDate FROM Opportunity
  WHERE npe03__Recurring_Donation__r.Committed_Giving_ID__c in
  ('${state.selectIDs.join("', '")}')`
);

fn(state => {
  const { records } = state.references[0];
  const SFMonth = records.map(rec => rec.CloseDate.split('-')[1]);
  const SFYear = records.map(rec => rec.CloseDate.split('-')[0]);

  const baseMapping = x => {
    return {
      Committed_Giving_ID__c: `${x.PrimKey}${x.DDId}${x.DDRefforBank}${x.Date}`,
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
    .filter(
      o =>
        state.selectIDs.includes(`${o.PrimKey}${o.DDId}`) &&
        SFMonth.includes(o.Date.split('/')[1]) &&
        SFYear.includes(o.Date.split('/')[2])
    )
    .map(x => {
      return {
        ...baseMapping(x),
      };
    });

  const opportunitiesToUpdateIDs = opportunitiesToUpdate.map(o => o.DDId);

  const opportunitiesToCreate = state.data.json
    .filter(o => !opportunitiesToUpdateIDs.includes(o.DDId))
    .map(x => {
      return {
        ...baseMapping(x),
      };
    });

  return { ...state, opportunitiesToUpdate, opportunitiesToCreate };
});

bulk(
  'Opportunity',
  'update',
  {
    extIdField: 'Committed_Giving_ID__c',
    failOnError: true,
    allowNoOp: true,
  },
  state => state.opportunitiesToUpdate
);

bulk(
  'Opportunity',
  'insert',
  {
    extIdField: 'Committed_Giving_ID__c',
    failOnError: true,
    allowNoOp: true,
  },
  state => state.opportunitiesToCreate
);

alterState(state => {
  // lighten state
  return { ...state, opportunitiesToCreate: [], opportunitiesToUpdate: [], selectIDs: [] };
});