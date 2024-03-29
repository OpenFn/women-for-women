alterState(state => {
  const formatDate = date => {
    if (!date) return null;
    date = date.split(' ')[0];
    const parts = date.match(/(\d+)/g);
    const year = String(parts[2]).length > 2 ? parts[2] : `20${parts[2]}`;
    return parts ? new Date(Number(year), parts[1] - 1, parts[0]).toISOString() : parts;
  };

  const opportunities = state.data.json.map(x => ({ ...x, cgID: `${x.PrimKey}${x.CC_ID}${x.CreatedDate}` }));

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
      //.filter(x => x.CC_ID) //TODO: Comment back in? Will we map CC_ID OR CardMasterID
      .map(x => {
        return {
          Committed_Giving_ID__c: x.CC_ID ? `${x.PrimKey}${x.CC_ID}${x.CreatedDate}` : `${x.PrimKey}${x.CardMasterID}${x['Transaction Date']}`,
          //Committed_Giving_ID__c: `${x.PrimKey}${x.CardMasterID}${x['Transaction Date']}`,
          //Committed_Giving_ID__c: `${x.PrimKey}${x.TransactionReference}${x['Transaction Date']}`, //Wrong UID?
          'Account.Committed_Giving_ID__c': `${x.PrimKey}`,
          'npsp__Primary_Contact__r.Committed_Giving_ID__c': `${x.PrimKey}`,
          Amount: x.Amount ? x.Amount.replace(/\£/g, '') : x.Amount,
          //Amount: x.Amount ? x.Amount.substring(1, x.Amount.length - 1) : '', //doesnt work if value is negative (-300)
          CurrencyIsoCode: 'GBP',
          StageName: 'Closed Won',
          CloseDate: x.CreatedDate ? state.formatDate(x.CreatedDate) : state.formatDate(x['Transaction Date']),
          'Campaign.Source_Code__c': x['PromoCode'],
          Name: 'test',
        };
      });
  }
);

// // query in order to perform the subsequent update. For create it's all good.
/*query(`SELECT id, Committed_Giving_ID__c FROM npe01__OppPayment__c WHERE Committed_Giving_ID__c != null`);

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
          Committed_Giving_ID__c: x.CC_ID ? `${x.PrimKey}${x.CC_ID}${x.CreatedDate}` : `${x.PrimKey}${x.CardMasterID}${x['Transaction Date']}`,
          CurrencyIsoCode: 'GBP',
          npe01__Payment_Method__c: 'Credit Card',
          npe01__Paid__c: true,
          npe01__Payment_Amount__c: x.Amount ? x.Amount.replace(/\£/g, '') : x.Amount,
          //npe01__Payment_Amount__c: x.Amount ? x.Amount.substring(1, x.Amount.length - 1) : '',
          npsp__Payment_Acknowledgment_Status__c: x.Status === 'Paid' ? 'Acknowledged' : x.Status,
          'Opportunity_Primary_Campaign_Source__r.Source_Code__c': x.PromoCode,
          wfw_Credit_Card_Type__c: x.CCType,
          npe01__Payment_Date__c: x.CreatedDate ? state.formatDate(x.CreatedDate) : state.formatDate(x['Transaction Date']),
        };
      });
  }
);

bulk(
  'npe01__OppPayment__c', // the sObject
  'upsert', //  the operation
  {
    extIdField: 'Committed_Giving_ID__c', // the field to match on
    failOnError: true, // throw error if just ONE record fails
    allowNoOp: true,
  },
  state => {
    console.log('Bulk creating payments.');
    return state.paymentsToCreate
      .filter(x => x.PrimKey)
      .map(x => {
        return {
          Committed_Giving_ID__c: x.CC_ID ? `${x.PrimKey}${x.CC_ID}${x.CreatedDate}` : `${x.PrimKey}${x.CardMasterID}${x['Transaction Date']}`,
          'npe01__Opportunity__r.Committed_Giving_ID__c': x.CC_ID ? `${x.PrimKey}${x.CC_ID}${x.CreatedDate}` : `${x.PrimKey}${x.CardMasterID}${x['Transaction Date']}`,
          CurrencyIsoCode: 'GBP',
          npe01__Payment_Method__c: 'Credit Card',
          npe01__Paid__c: true,
          npe01__Payment_Amount__c: x.Amount ? x.Amount.replace(/\£/g, '') : x.Amount,
          //npe01__Payment_Amount__c: x.Amount ? x.Amount.substring(1, x.Amount.length - 1) : '',
          npsp__Payment_Acknowledgment_Status__c: x.Status === 'Paid' ? 'Acknowledged' : x.Status,
          'Opportunity_Primary_Campaign_Source__r.Source_Code__c': x.PromoCode,
          wfw_Credit_Card_Type__c: x.CCType,
          npe01__Payment_Date__c: x.CreatedDate ? state.formatDate(x.CreatedDate) : state.formatDate(x['Transaction Date']),
        };
      });
  }
);*/

alterState(state => {
  // lighten state
  return { ...state, opportunities: [], cgIDs: {} };
});
