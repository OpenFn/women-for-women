alterState(state => {
  const formatDate = date => {
    if (!date) return null;
    date = date.split(' ')[0];
    const parts = date.match(/(\d+)/g);
    const year = String(parts[2]).length > 2 ? parts[2] : `20${parts[2]}`;
    return parts ? new Date(Number(year), parts[1] - 1, parts[0]).toISOString() : parts;
  };

  function reduceArray(array, groupBy) {
    return array.reduce((r, a) => {
      r[a[groupBy]] = r[a[groupBy]] || [];
      r[a[groupBy]].push(a);

      return r;
    }, Object.create(null));
  }
  const flattenArray = obj => {
    const json = [];
    for (key of obj) {
      for (ob of key) json.push(ob);
    }
    return json;
  };

  let arrayReduced = reduceArray(state.data.json, 'CardMasterID');
  const groupedCardMaster = [];
  for (key in arrayReduced) groupedCardMaster.push(arrayReduced[key]);

  let CardMasterIDLessThan1 = groupedCardMaster.filter(x => x.length <= 1);
  CardMasterIDLessThan1 = flattenArray(CardMasterIDLessThan1).filter(x => {
    const Amount = x.Amount && isNaN(x.Amount[0]) ? x.Amount.substring(1) : x.Amount;
    return Number(Amount) % 22 !== 0;
  });

  return { ...state, CardMasterIDLessThan1, formatDate };
});

bulk(
  'Opportunity',
  'upsert',
  {
    extIdField: 'Committed_Giving_ID__c',
    failOnError: true,
    allowNoOp: true,
  },
  state => {
    console.log('Bulk upserting Opportunities with count transaction less than 1.');
    return state.CardMasterIDLessThan1.map(x => {
      const Amount = x.Amount ? x.Amount.replace(/\£/g, '') : x.Amount;
      return {
        Credit_Card_Type__c: x.CCType,
        Type__c: 'Recurring Donation',
        'npe03__Recurring_Donation_Campaign__r.Source_Code__c': 'UKWEB',
        npe03__Amount__c: Amount,
        Committed_Giving_ID__c: `${x.PrimKey}${x.CardMasterID}${x.TransactionReference}`,
        'npe03__Recurring_Donation__r.Committed_Giving_ID__c': `${x.PrimKey}${x.CardMasterID}`,
        Amount,
        RecordTypeId: 'Individual Giving',
        Donation_Type__c: 'General Giving',
        StageName: 'Closed Won',
        npsp__Acknowledgment_Status__c: x.Status === 'Paid' ? 'Acknowledged' : x.Status,
        CC_Type__c: x.CCType,
        Transaction_Reference_Id__c: x.TransactionReference,
        CloseDate: x.SettlementDate,
      };
    });
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
    console.log('Bulk upserting Recurring Donation with count transaction greater than 1.');
    return state.CardMasterIDGreaterThan1.map(x => {
      const Amount = x.Amount ? x.Amount.replace(/\£/g, '') : x.Amount;
      return {
        Committed_Giving_ID__c: `${x.PrimKey}${x.CardMasterID}${x.TransactionReference}`,
        Credit_Card_Type__c: x.CCType,
        Type__c: 'Recurring Donation',
        'npe03__Recurring_Donation_Campaign__r.Source_Code__c': 'UKRG',
        npe03__Amount__c: Amount,
      };
    });
  }
);

alterState(state => {
  return { ...state, opportunities: [], cgIDs: {} };
});
