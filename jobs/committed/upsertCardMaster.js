alterState(state => {
  const formatDate = date => {
    if (!date) return null;
    date = date.split(' ')[0];
    const parts = date.match(/(\d+)/g);
    return parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
  };

  state.data.json.map(x => {
    if (x.LastCredited === null) {
      console.log(`No actions taken for ${x.CardMasterID}.`);
    }
  });

  const donations = state.data.json
    .filter(x => x.LastCredited !== null)
    .filter(x => x.Occurrence === 'Yearly' || x.Occurrence === 'Monthly');
  // .map(x => {
  //   // TODO: move fields(...) mapping into here.
  //   return x;
  // });

  const opportunities = state.data.json
    .filter(x => x.LastCredited !== null)
    .filter(x => x.Occurrence !== 'Yearly' && x.Occurrence !== 'Monthly')
    .map(x => ({ ...x, cgID: `${x.PrimKey}${x.TransactionReference}` }));

  const cgIDs = opportunities.map(o => `'${o.cgID}'`);

  return { ...state, donations, opportunities, cgIDs, formatDate };
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
    return state.donations.map(x => {
      return {
        Committed_Giving_ID__c: `${x.PrimKey}${x.CardMasterID}`,
        Name: x.CardMasterID,
        'npe03__Contact__r.Committed_Giving_Id__c': x.PrimKey,
        npe03__Installment_Period__c: x.Occurrence,
        Type__c: x['Recurring Donation'],
        npe03__Amount__c: x.Amount,
        Closeout_Date__c: state.formatDate(x.EndDate),
        npsp__StartDate__c: state.formatDate(x.StartDate),
        npe03__Next_Payment_Date__c: state.formatDate(x.NextDate),
        Closeout_Reason__c: x.RecurringCancelReason,
        Closeout_Date__c: state.formatDate(x.RecurringCancelDate),
      };
    });
  }
);

bulk(
  'Opportunity', // the sObject
  'upsert', //  the operation
  {
    extIdField: 'Committed_Giving_ID__c', // the field to match on
    failOnError: true, // throw error if just ONE record fails
    allowNoOp: true,
  },
  state => {
    console.log('Bulk upserting opportunities.');
    return state.opportunities.map(x => {
      return {
        Committed_Giving_ID__c: `${x.PrimKey}${x.CardMasterID}`,
        'RecordType.Name': 'Individual Giving', // HARDCODED
        AccountId: '0013K00000jOtMNQA0', // HARDCODED.
        'npsp__Primary_Contact__r.Committed_Giving_Id__c': x.PrimKey,
        Name: x.CardMasterID,
        CG_Credit_Card_ID__c: x.CardMasterID,
        CC_Exp_Month__c: x.CCExpiry.split('/')[0],
        CC_Exp_Year__c: x.CCExpiry.split('/')[1],
        Transaction_Reference_Id__c: x.TransactionReference,
        Transaction_Date_Time__c: state.formatDate(x.AddedDateTime),
        Amount: x.Amount,
        CurrencyIsoCode: x.GBP,
        StageName: 'Closed Won',
        CloseDate: state.formatDate(x.LastCredited),
      };
    });
  }
);

// TODO: confirm whether or not we need to get the "ID" from Salesforce in this
// query in order to perform the subsequent update. For create it's all good.
query(
  `SELECT id, Committed_Giving_ID__c FROM npe01__OppPayment__c WHERE Committed_Giving_ID__c IN [${state =>
    state.cgIDs}]`
);

alterState(state => {
  const { records } = state.references[0];

  const paymentsToCreate = state.opportunities.filter(o => !records.includes(o.cgID));
  const paymentsToUpdate = state.opportunities.filter(o => records.includes(o.cgID));

  return { ...state, paymentsToCreate, paymentsToUpdate };
});

bulk(
  'npe01__OppPayment__c', // the sObject
  'update', //  the operation
  {
    // extIdField: 'Committed_Giving_ID__c', // the field to match on
    failOnError: true, // throw error if just ONE record fails
    allowNoOp: true,
  },
  state => {
    console.log('Bulk updating payments.');
    return state.paymentsToUpdate.map(x => {
      return {
        // id: 'ds8908932k3l21j3213j1kl31', // TD thinks that you need this!
        Committed_Giving_ID__c: `${x.PrimKey}${x.TransactionReference}`,
        'npe01__Opportunity__r.Committed_Giving_ID__c': `${x.PrimKey}${x.CardMasterID}`,
        CurrencyIsoCode: 'GBP',
        npe01__Payment_Method__c: 'Credit Card',
        npe01__Paid__c: true,
        npe01__Payment_Date__c: state.formatDate(x.AddedDateTime),
        npe01__Payment_Amount__c: x.Amount,
      };
    });
  }
);

bulk(
  'npe01__OppPayment__c', // the sObject
  'create', //  the operation
  {
    // extIdField: 'Committed_Giving_ID__c', // the field to match on
    failOnError: true, // throw error if just ONE record fails
    allowNoOp: true,
  },
  state => {
    console.log('Bulk creating payments.');
    return state.paymentsToCreate.map(x => {
      return {
        Committed_Giving_ID__c: `${x.PrimKey}${x.TransactionReference}`,
        'npe01__Opportunity__r.Committed_Giving_ID__c': `${x.PrimKey}${x.CardMasterID}`,
        CurrencyIsoCode: 'GBP',
        npe01__Payment_Method__c: 'Credit Card',
        npe01__Paid__c: true,
        npe01__Payment_Date__c: state.formatDate(x.AddedDateTime),
        npe01__Payment_Amount__c: x.Amount,
      };
    });
  }
);
