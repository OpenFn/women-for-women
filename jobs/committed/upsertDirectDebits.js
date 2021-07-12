bulk(
  'npe03__Recurring_Donation__c', // the sObject
  'upsert', //  the operation
  {
    extIdField: 'Committed_Giving_ID__c', // the field to match on
    failOnError: true, // throw error if just ONE record fails
    allowNoOp: true, // what is this?
  },
  state => {
    const formatDate = date => {
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
          'npe03__Contact__r.Committed_Giving_Id__c': x.PrimKey,
          Type__c: x.TransType === 'Sponsorship' ? 'Sponsorship' : 'Recurring Donation',
          npe03__Amount__c: x['Regular amount'],
          Status__c: x.Status === 'live' ? 'Active' : 'Canceled',
          Closeout_Reason__c: x.CancelReason, //different field name? 
          //npsp__ClosedReason__c: x.CancelReason,
          npe03__Installment_Period__c: x.PaymentFrequency,
          npsp__StartDate__c: formatDate(x.StartDate),
          npe03__Date_Established__c: formatDate(x.AddedDateTime),
          npe03__Next_Payment_Date__c: formatDate(x.NextDate),
          npsp__EndDate__c: formatDate(x.EndDate),
          of_Sisters_Requested__c: x['Number of sponsorships']===' ' ? undefined : x['Number of sponsorships'],
          Committed_Giving_Direct_Debit_Reference__c: x.DDRefforBank,
        };
      });
  }
);
