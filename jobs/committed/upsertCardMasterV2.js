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

  const increaseMonth = date => {
    let dateEstablished = formatDate(date);
    const month = new Date(dateEstablished).getUTCMonth();
    dateEstablished = new Date(dateEstablished).setUTCMonth(month + 1);
    return new Date(dateEstablished);
  };

  const baseMapping = x => {
    return {
      Committed_Giving_ID__c: `${x.PrimKey}${x.CardMasterID}`,
      CG_Credit_Card_ID__c: x.CardMasterID,
      Name: x.CardMasterID,
      'npe03__Contact__r.Committed_Giving_Id__c': x.PrimKey,
      npe03__Installment_Period__c: x.Occurrence,
      npe03__Amount__c: x.Amount,
      //Closeout_Date__c: formatDate(x.EndDate), // THIS IS DUPLICATED - TO CHECK
      Closeout_Date__c: formatDate(x.RecurringCancelDate),
      Closeout_Reason__c: x.RecurringCancelReason,
      npsp__StartDate__c: formatDate(x.StartDate),
      //npe03__Next_Payment_Date__c: formatDate(x.NextDate), REMOVED MAPPING ON NEXT DONATION DATE
      npsp__PaymentMethod__c: 'Credit Card',
      npe03__Date_Established__c: increaseMonth(x.AddedDateTime),
      of_Sisters_Requested__c: x.Occurrence === 'Yearly' ? x.Amount / 264 : x.Amount / 22,
      //'Sponsor__r.Committed_Giving_Id__c': x.PrimKey,
    };
  };

  const donationsYearlyOrMonthly = state.data.json.filter(
    x => x.PrimKey && (x.Occurrence === 'Monthly' || x.Occurrence === 'Yearly')
  );

  const sponsorships = donationsYearlyOrMonthly
    .filter(x => Number(selectAmount(x)) % 22 === 0)
    .map(x => {
      return {
        ...baseMapping(x),
        ...{
          Type__c: 'Sponsorship',
          'npe03__Recurring_Donation_Campaign__r.Source_Code__c': 'UKSPCC',
        },
      };
    });

  const sponsorshipIDs = sponsorships.map(x => x.Name);

  const donations = donationsYearlyOrMonthly
    .filter(x => !sponsorshipIDs.includes(x.CardMasterID))
    .map(x => {
      return {
        ...baseMapping(x),
        ...{
          Type__c: 'Recurring Donation',
          'npe03__Recurring_Donation_Campaign__r.Source_Code__c': 'UKRG',
        },
      };
    });

  return { ...state, sponsorships, donations, formatDate };
});

bulk(
  'npe03__Recurring_Donation__c',
  'upsert',
  {
    extIdField: 'Committed_Giving_ID__c',
    failOnError: true,
    allowNoOp: true,
  },
  state => {
    console.log('Bulk upserting Sponsorship.');
    return state.sponsorships;
  }
);

bulk(
  'npe03__Recurring_Donation__c',
  'upsert',
  {
    extIdField: 'Committed_Giving_ID__c',
    failOnError: true,
    allowNoOp: true,
  },
  state => {
    console.log('Bulk upserting donations.');
    return state.donations;
  }
);

fn(state => {
  // lighten state
  return { ...state, sponsorships: [], donations: [] };
});
