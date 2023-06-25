fn(state => {
  const formatDate = date => {
    if (!date || date === 'NULL') return null;
    date = date.split(' ')[0];
    const parts = date.match(/(\d+)/g);
    const year = String(parts[2]).length > 2 ? parts[2] : `20${parts[2]}`;
    return parts ? new Date(Number(year), parts[1] - 1, parts[0]).toISOString() : parts;
  };

  const selectAmount = item => {
    if (item['Current amount']) {
      return isNaN(item['Current amount'])
        ? item['Current amount'].replace(/[^-.0-9]/g, '')
        : parseInt(item['Current amount']);
    }
    return undefined;
  };
  // Use for TransType re-processing if CG provides the incorrect value
  // const selectAmount = item => {
  //   if (item['FirstAmount']) { //CHANGED FROM: 'Current amount'
  //     return isNaN(item['FirstAmount']) ? item['FirstAmount'].replace(/[^-.0-9]/g, '') : parseInt(item['FirstAmount']);
  //   }
  //   return undefined;
  // };

  const donations = state.data.json
    .filter(x => x.PrimKey)
    .map(x => {
      return {
        Committed_Giving_ID__c: `${x.PrimKey}${x.DDId}`,
        Committed_Giving_Direct_Debit_ID__c: x.DDId,
        'npe03__Contact__r.Committed_Giving_Id__c': x.PrimKey,
        'Sponsor__r.Committed_Giving_Id__c': x.PrimKey,
        Type__c: x.TransType === 'Sponsorship' ? 'Sponsorship' : 'Recurring Donation',
        'npe03__Recurring_Donation_Campaign__r.Source_Code__c': x.TransType === 'Sponsorship' ? 'UKSPCC' : 'UKRG',
        npe03__Amount__c: x['Current amount'],
        npsp__Status__c: x.Status === 'Live' ? 'Active' : undefined,
        Active__c: x.Status === 'Live' ? true : undefined, //Nov 2022 Request: To not uncheck Active, only add Closeout Date
        Closeout_Reason__c: x.CancelReason,
        npe03__Installment_Period__c: x.PaymentFrequency === 'Annually' ? 'Yearly' : x.PaymentFrequency,
        npe03__Date_Established__c: x.AddedDateTime ? formatDate(x.AddedDateTime) : x.AddedDateTime,
        npe03__Next_Payment_Date__c: !x.CancelDate ? formatDate(x.NextDate) : undefined,
        npsp__EndDate__c: x.EndDate ? formatDate(x.EndDate) : x.EndDate,
        Committed_Giving_Direct_Debit_Reference__c: x.DDRefforBank,
        npsp__PaymentMethod__c: 'Direct Debit',
        Closeout_Date__c: x.CancelDate ? formatDate(x.CancelDate) : x.CancelDate,
        npe03__Open_Ended_Status__c: x.CancelDate && x.Status !== 'Live' ? 'Closed' : undefined,
        of_Sisters_Requested__c:
          x['Current amount'] == '22.00'
            ? 1
            : x['Current amount'] % 264 === 0 || (x.PaymentFrequency === 'Annually' && x.TransType === 'Sponsorship')
            ? Math.floor(Math.abs(x['Current amount'] / 264))
            : x.PaymentFrequency === 'Quarterly' && x.TransType === 'Sponsorship'
            ? Math.floor(Math.abs(x['Current amount'] / 66))
            : x['Current amount'] % 22 === 0 || (x.PaymentFrequency === 'Monthly' && x.TransType === 'Sponsorship')
            ? Math.floor(Math.abs(x['Current amount'] / 22))
            : undefined,
        // Use for TransType re-processing if CG provides the incorrect value
        // of_Sisters_Requested__c: (x['FirstAmount'] == '22' ? 1 :
        // x['FirstAmount'] % 264 === 0 || (x.PaymentFrequency === 'Annually' && x.TransType === 'Sponsorship') ? Math.floor(Math.abs(x['FirstAmount'] / 264)) :
        //     (x.PaymentFrequency === 'Quarterly' && x.TransType === 'Sponsorship') ? Math.floor(Math.abs(x['FirstAmount'] / 66)) :
        //       x['FirstAmount'] % 22 === 0 || (x.PaymentFrequency === 'Monthly' && x.TransType === 'Sponsorship') ? Math.floor(Math.abs(x['FirstAmount'] / 22)) :
        //       undefined),
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

fn(state => {
  // lighten state
  return { ...state, donations: [] };
});
