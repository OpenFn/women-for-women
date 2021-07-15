// bulk(
//   'npe03__Recurring_Donation__c', // the sObject
//   'upsert', //  the operation
//   {
//     extIdField: 'Committed_Giving_ID__c', // the field to match on
//     failOnError: true, // throw error if just ONE record fails
//     allowNoOp: true, // what is this?
//   },
//   state => {
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
//           'npe03__Contact__r.Committed_Giving_Id__c': x.PrimKey,
//           Type__c: x.TransType === 'Sponsorship' ? 'Sponsorship' : 'Recurring Donation',
//           npe03__Amount__c: x['Current amount'], //Changed from Regular amount
//           Status__c: x.Status === 'live' ? 'Active' : 'Canceled',
//           Closeout_Reason__c: x.CancelReason, //different field name?
//           //npsp__ClosedReason__c: x.CancelReason,
//           npe03__Installment_Period__c: x.PaymentFrequency,
//           npe03__Date_Established__c: '2015-08-25',
//           //npe03__Date_Established__c: x.StartDate ? formatDate(x.StartDate) : x.StartDate, //TODO: Confirm with Torian this triggers payments
//           npe03__Next_Payment_Date__c: x.NextDate ? formatDate(x.NextDate) : x.NextDate,
//           npsp__EndDate__c: x.EndDate ? formatDate(x.EndDate) : x.EndDate,
//           of_Sisters_Requested__c: x['Number of sponsorships'] === ' ' ? undefined : x['Number of sponsorships'],
//           Committed_Giving_Direct_Debit_Reference__c: x.DDRefforBank,
//         };
//       });
//   }
// );
upsert('npe03__Recurring_Donation__c', 'Committed_Giving_ID__c', state => {
    const formatDate = date => {
      console.log('date', date);
      if (isNaN(new Date(date).getTime())) return null;
      if (!date) return null;
      date = date.split(' ')[0];
      const parts = date.match(/(\d+)/g);
      const year = String(parts[2]).length > 2 ? parts[2] : `20${parts[2]}`;
      return parts ? new Date(Number(year), parts[1] - 1, parts[0]).toISOString() : parts;
    };

    return state.data.json
      .filter(x => x.PrimKey)
      .map(x => {
        return {
          Committed_Giving_ID__c: `${x.PrimKey}${x.DDId}`,
          Committed_Giving_Direct_Debit_ID__c: x.DDId,
          npe03__Contact__c: '0030n00000qsDggAAE',
          //'npe03__Contact__r.Committed_Giving_Id__c': x.PrimKey,
          Type__c: x.TransType === 'Sponsorship' ? 'Sponsorship' : 'Recurring Donation',
          npe03__Amount__c: x['Current amount'], //Changed from Regular amount
          Status__c: x.Status === 'live' ? 'Active' : 'Canceled',
          Closeout_Reason__c: x.CancelReason, //different field name?
          //npsp__ClosedReason__c: x.CancelReason,
          npe03__Installment_Period__c: x.PaymentFrequency,
          npe03__Date_Established__c: '2015-08-25',
          //npe03__Date_Established__c: x.StartDate ? formatDate(x.StartDate) : x.StartDate, //TODO: Confirm with Torian this triggers payments
          npe03__Next_Payment_Date__c: x.NextDate ? formatDate(x.NextDate) : undefined,
          npsp__EndDate__c: x.EndDate ? formatDate(x.EndDate) : undefined,
          of_Sisters_Requested__c: x['Number of sponsorships'] === ' ' ? undefined : x['Number of sponsorships'],
          Committed_Giving_Direct_Debit_Reference__c: x.DDRefforBank,
        };
      });
  })

