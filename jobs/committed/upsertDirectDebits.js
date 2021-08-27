fn(state => {
  const formatDate = date => {
    if (!date) return null;
    date = date.split(' ')[0];
    const parts = date.match(/(\d+)/g);
    const year = String(parts[2]).length > 2 ? parts[2] : `20${parts[2]}`;
    return parts ? new Date(Number(year), parts[1] - 1, parts[0]).toISOString() : parts;
  };

  const donations = state.data.json
    .filter(x => x.PrimKey)
    .map(x => {
      return {
        Committed_Giving_ID__c: `${x.PrimKey}${x.DDId}`,
        Committed_Giving_Direct_Debit_ID__c: x.DDId,
        'npe03__Contact__r.Committed_Giving_Id__c': x.PrimKey,
        'Sponsor__r.Committed_Giving_Id__c': x.PrimKey, //TODO: Overwrite in custom DD mappings?
        Type__c: x.TransType === 'Sponsorship' ? 'Sponsorship' : 'Recurring Donation',
        'npe03__Recurring_Donation_Campaign__r.Source_Code__c': x.TransType === 'Sponsorship' ? 'UKSPCC' : 'UKRG',
        npe03__Amount__c: x['Current amount'],
        npsp__Status__c: x.Status === 'Live' ? 'Active' : 'Closed',
        Active__c: x.Status === 'Live' ? true : false, //TO TEST
        Closeout_Reason__c: x.CancelReason,
        npe03__Installment_Period__c: x.PaymentFrequency,
        npe03__Date_Established__c: x.AddedDateTime ? formatDate(x.AddedDateTime) : x.AddedDateTime, //NOTE: Returning 'null' value?
        //npe03__Next_Payment_Date__c: x.NextDate ? formatDate(x.NextDate) : x.NextDate, //NOTE: Not mapping so that Opps will be auto-inserted for this RD
        npsp__EndDate__c: x.EndDate ? formatDate(x.EndDate) : x.EndDate,
        of_Sisters_Requested__c: x['Number of sponsorships'] === ' ' ? undefined : x['Number of sponsorships'],
        Committed_Giving_Direct_Debit_Reference__c: x.DDRefforBank,
        npsp__PaymentMethod__c: 'Direct Debit',
        Closeout_Date__c: x.CancelDate ? formatDate(x.CancelDate) : x.CancelDate,
      };
    });

  return { ...state, donations };
});

bulk(
  'npe03__Recurring_Donation__c', // the sObject
  'upsert', //  the operation
  {
    extIdField: 'Committed_Giving_ID__c',
    failOnError: true,
    allowNoOp: true,
  },
  state => state.donations
);

// upsert('npe03__Recurring_Donation__c', 'Committed_Giving_ID__c', state => {
//     const formatDate = date => {
//       console.log('date', date);
//       if (isNaN(new Date(date).getTime())) return null;
//       if (!date) return null;
//       date = date.split(' ')[0];
//       const parts = date.match(/(\d+)/g);
//       const year = String(parts[2]).length > 2 ? parts[2] : `20${parts[2]}`;
//       return parts ? new Date(Number(year), parts[1] - 1, parts[0]).toISOString() : parts;
//     };

//     return state.data.json
//       .filter(x => x.PrimKey)
//       .map(x => {
//         return {
//           Committed_Giving_ID__c: `${x.PrimKey}${x.DDId}`,
//           Committed_Giving_Direct_Debit_ID__c: x.DDId,
//           npe03__Contact__c: '0030n00000qsDggAAE',
//           //'npe03__Contact__r.Committed_Giving_Id__c': x.PrimKey,
//           Type__c: x.TransType === 'Sponsorship' ? 'Sponsorship' : 'Recurring Donation',
//           npe03__Amount__c: x['Current amount'], //Changed from Regular amount
//           npsp__Status__c: x.Status === 'live' ? 'Active' : 'Closed',
//           Closeout_Reason__c: x.CancelReason, //different field name?
//           //npsp__ClosedReason__c: x.CancelReason,
//           npe03__Installment_Period__c: x.PaymentFrequency,
//           npe03__Date_Established__c: '2015-08-25',
//           //npe03__Date_Established__c: x.StartDate ? formatDate(x.StartDate) : x.StartDate, //TODO: Confirm with Torian this triggers payments
//           npe03__Next_Payment_Date__c: x.NextDate ? formatDate(x.NextDate) : undefined,
//           npsp__EndDate__c: x.EndDate ? formatDate(x.EndDate) : undefined,
//           of_Sisters_Requested__c: x['Number of sponsorships'] === ' ' ? undefined : x['Number of sponsorships'],
//           Committed_Giving_Direct_Debit_Reference__c: x.DDRefforBank,
//         };
//       });
//   })

fn(state => {
  // lighten state
  return { ...state, donations: [] };
});
