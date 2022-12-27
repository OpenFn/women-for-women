fn(state => {
  const formatDate = date => {
    if (!date || date ==='NULL') return null;
    date = date.split(' ')[0];
    const parts = date.match(/(\d+)/g);
    const year = String(parts[2]).length > 2 ? parts[2] : `20${parts[2]}`;
    return parts ? new Date(Number(year), parts[1] - 1, parts[0]).toISOString() : parts;
  };

  const selectAmount = item => {
    if (item['Current amount']) { //CHANGED FROM: 'Current amount'
      return isNaN(item['Current amount']) ? item['Current amount'].replace(/[^-.0-9]/g, '') : parseInt(item['Current amount']);
    }
    return undefined;
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
        Active__c: x.Status === 'Live' ? true : undefined, //Nov 2022 Request: To not uncheck Active, only add Closeout Date
        Closeout_Reason__c: x.CancelReason,
        npe03__Installment_Period__c: x.PaymentFrequency === 'Annually' ? 'Yearly' : x.PaymentFrequency,
        //npe03__Date_Established__c: x.AddedDateTime ? formatDate(x.AddedDateTime) : x.AddedDateTime,
        //npe03__Next_Payment_Date__c: !x.CancelDate ? formatDate(x.NextDate) : undefined,
        //npsp__EndDate__c: x.EndDate ? formatDate(x.EndDate) : x.EndDate,
        of_Sisters_Requested__c: (x['Current amount'] == '22.00' ? 1 : 
        x['Current amount'] % 264 === 0 || (x.PaymentFrequency === 'Annually' && x.TransType === 'Sponsorship') ? Math.floor(Math.abs(x['Current amount'] / 264)) :
            (x.PaymentFrequency === 'Quarterly' && x.TransType === 'Sponsorship') ? Math.floor(Math.abs(x['Current amount'] / 66)) :
              x['Current amount'] % 22 === 0 || (x.PaymentFrequency === 'Monthly' && x.TransType === 'Sponsorship') ? Math.floor(Math.abs(x['Current amount'] / 22)) : 
              undefined),
        // Number(selectAmount(x)) % 264 === 0 || (x.PaymentFrequency === 'Annually' && x.TransType === 'Sponsorship') ? Math.floor(Math.abs(x['Current amount'] / 264)) :
        //     (x.PaymentFrequency === 'Quarterly' && x.TransType === 'Sponsorship') ? Math.floor(Math.abs(x['Current amount'] / 66)) :
        //       Number(selectAmount(x)) % 22 === 0 || (x.PaymentFrequency === 'Monthly' && x.TransType === 'Sponsorship') ? Math.floor(Math.abs(x['Current amount'] / 22)) : 
        //       undefined), 
        // of_Sisters_Requested__c: x.Status === 'Live' ?
        //   (Number(selectAmount(x)) % 264 === 0 || (x.PaymentFrequency === 'Annually' && x.TransType === 'Sponsorship') ? Math.floor(Math.abs(x['Current amount'] / 264)) :
        //     (x.PaymentFrequency === 'Quarterly' && x.TransType === 'Sponsorship') ? Math.floor(Math.abs(x['Current amount'] / 66)) :
        //       Number(selectAmount(x)) % 22 === 0 || (x.PaymentFrequency === 'Monthly' && x.TransType === 'Sponsorship') ? Math.floor(Math.abs(x['Current amount'] / 22)) : undefined) : undefined,
        Committed_Giving_Direct_Debit_Reference__c: x.DDRefforBank,
        npsp__PaymentMethod__c: 'Direct Debit',
        //Closeout_Date__c: x.CancelDate ? formatDate(x.CancelDate) : x.CancelDate,
      };
    });

  return { ...state, donations };
});

bulk(
  'npe03__Recurring_Donation__c', // the sObject
  'upsert', //  the operation
  {
    extIdField: 'Committed_Giving_ID__c',
    failOnError: false,
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
