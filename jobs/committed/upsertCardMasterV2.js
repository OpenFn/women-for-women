fn(state => {
  const formatDate = date => {
    if (!date) return null;
    date = date.split(' ')[0];
    const parts = date.match(/(\d+)/g);
    const year = String(parts[2]).length > 2 ? parts[2] : `20${parts[2]}`;
    return parts ? new Date(Number(year), parts[1] - 1, parts[0]).toISOString() : parts;
  };

  state.data.json.map(x => {
    if (x.LastCredited === null) {
      console.log(`No actions taken for ${x.CardMasterID}.`);
    }
  });

  const donations = state.data.json
    .filter(x => x.LastCredited !== null)
    .filter(x => x.Occurrence === 'Yearly' || x.Occurrence === 'Monthly');

  return { ...state, donations, formatDate };
});

bulk(
  'npe03__Recurring_Donation__c', // the sObject
  'upsert', //  the operation
  {
    extIdField: 'Committed_Giving_ID__c', // the field to match on
    failOnError: true, // throw error if just ONE record fails
    allowNoOp: true,
  },
  state => {
    console.log('Bulk upserting donations.');
    return state.donations
      .filter(x => x.PrimKey)
      .map(x => {
        const of_Sisters_Requested__c =
          Number(x.Amount) % 22 === 0 ? (x.Occurrence === 'Yearly' ? x.Amount / 264 : x.Amount / 12) : undefined;

        return {
          Committed_Giving_ID__c: `${x.PrimKey}${x.CardMasterID}`,
          Name: x.CardMasterID,
          'npe03__Contact__r.Committed_Giving_Id__c': x.PrimKey,
          npe03__Installment_Period__c: x.Occurrence,
          npe03__Amount__c: x.Amount,
          Closeout_Date__c: state.formatDate(x.EndDate),
          npsp__StartDate__c: state.formatDate(x.StartDate),
          npe03__Next_Payment_Date__c: state.formatDate(x.NextDate),
          Closeout_Reason__c: x.RecurringCancelReason,
          Closeout_Date__c: state.formatDate(x.RecurringCancelDate),

          Type__c: Number(x.Amount) % 22 === 0 ? 'Sponsorship' : 'Recurring Donation',
          'npe03__Recurring_Donation_Campaign__r.Source_Code__c': Number(x.Amount) % 22 === 0 ? 'UKSPCC' : 'UKRG',
          of_Sisters_Requested__c,

          'Sponsor__r.Committed_Giving_Id__c': x.PrimKey,
        };
      });
  }
);

fn(state => {
  // lighten state
  return { ...state, donations: [] };
});
