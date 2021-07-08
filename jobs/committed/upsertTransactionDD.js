alterState(state => {
  const formatDate = date => {
    if (!date) return null;
    date = date.split(' ')[0];
    const parts = date.match(/(\d+)/g);
    return parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
  };

  const opportunities = state.data.json.map(x => ({ ...x, cgID: `${x.PrimKey}${x.DDRefforBank}${x['Date']}` }));

  const cgIDs = opportunities.map(o => `'${o.cgID}'`);

  return { ...state, opportunities, cgIDs, formatDate };
});

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
    return state.data.json
      .filter(x => x.PrimKey)
      .map(x => {
        //console.log('x.Amount', x.Amount);
        const Amount = parseInt(x.Amount) !== 'NaN' ? parseInt(x.Amount) : x.Amount.substring(1, x.Amount.length - 1);
        return {
          Committed_Giving_ID__c: `${x.PrimKey}${x.DDRefforBank}${x['Date']}`,
          'npsp__Primary_Contact__r.Committed_Giving_ID__c': `${x.PrimKey}`,
          Account: '0010n00001E2Z3eAAF', // TODO: Find Contact Account, map here
          Amount,
          CurrencyIsoCode: 'GBP',
          StageName: 'Closed Won',
          CloseDate: state.formatDate(x['Date']),
          npsp__Closed_Lost_Reason__c: x['Unpaid reason'],
          Name: 'test'
        };
      });
  }
);

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

    return state.data.json
      .filter(x => x.PrimKey)
      .map(x => {
        return {
          Committed_Giving_ID__c: `${x.PrimKey}${x.DDRefforBank}`,
          Committed_Giving_Direct_Debit_Reference__c: x.DDRefforBank,
        };
      });
  }
);

// query in order to perform the subsequent update. For create it's all good.
query(`SELECT id, Committed_Giving_ID__c FROM npe01__OppPayment__c`);

alterState(state => {
  const { records } = state.references[0];

  const paymentsToUpdate = state.opportunities.filter(o => records.includes(o.cgID));
  const paymentsToCreate = state.opportunities.filter(o => !records.includes(o.cgID));

  return { ...state, paymentsToUpdate, paymentsToCreate };
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
    return state.paymentsToUpdate
      .filter(x => x.PrimKey)
      .map(x => {
        return {
          // id: 'ds8908932k3l21j3213j1kl31', // Is this needed??
          Committed_Giving_ID__c: `${x.PrimKey}${x.DDRefforBank}`,
          'npe01__Opportunity__r.Committed_Giving_ID__c': `${x.PrimKey}${x.DDRefforBank}`,
          CurrencyIsoCode: 'GBP',
          npe01__Payment_Method__c: 'Direct Debit',
          npe01__Paid__c: true,
          'Opportunity_Primary_Campaign_Source__r.Source_Code__c': x.PromoCode,
          npe01__Payment_Date__c: state.formatDate(x.Date),
        };
      });
  }
);

bulk(
  'npe01__OppPayment__c', // the sObject
  'insert', //  the operation
  {
    // extIdField: 'Committed_Giving_ID__c', // the field to match on
    failOnError: true, // throw error if just ONE record fails
    allowNoOp: true,
  },
  state => {
    console.log('Bulk creating payments.');
    return state.paymentsToCreate
      .filter(x => x.PrimKey)
      .map(x => {
        return {
          Committed_Giving_ID__c: `${x.PrimKey}${x.DDRefforBank}`,
          'npe01__Opportunity__r.Committed_Giving_ID__c': `${x.PrimKey}${x.DDRefforBank}`,
          CurrencyIsoCode: 'GBP',
          npe01__Payment_Method__c: 'Direct Debit',
          npe01__Paid__c: true,
          npe01__Payment_Amount__c: x.Amount,
          'Opportunity_Primary_Campaign_Source__r.Source_Code__c': x.PromoCode,
          wfw_Credit_Card_Type__c: x.CCType,
          npe01__Payment_Date__c: state.formatDate(x.Date),
        };
      });
  }
);

alterState(state => {
  // lighten state
  return { ...state, opportunities: [], cgIDs: {} };
});
