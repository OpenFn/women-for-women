fn(state => {
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
  const cgIDLess1s = CardMasterIDLessThan1.map(cm => cm.CardMasterID);

  const CardMasterIDGreaterThan1 = state.data.json
    .filter(x => !cgIDLess1s.includes(x.CardMasterID))
    .filter(x => {
      const Amount = x.Amount && isNaN(x.Amount[0]) ? x.Amount.substring(1) : x.Amount;
      return Number(Amount) % 22 !== 0;
    });
  const cgIDMore1s = CardMasterIDGreaterThan1.map(cm => cm.CardMasterID);

  const TransactionMultiple22 = state.data.json.filter(
    x => !cgIDLess1s.includes(x.CardMasterID) && !cgIDMore1s.includes(x.CardMasterID)
  );

  const TransactionsToMatch = state.data.json.filter(x => !cgIDLess1s.includes(x.CardMasterID));

  const selectIDs = TransactionsToMatch.map(x => `${x.PrimKey}${x.CardMasterID}`);

  return {
    ...state,
    CardMasterIDLessThan1,
    CardMasterIDGreaterThan1,
    TransactionMultiple22,
    TransactionsToMatch,
    selectIDs,
    formatDate,
  };
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
        Committed_Giving_ID__c: `${x.PrimKey}${x.CardMasterID}${x.TransactionReference}`,
        //'npe03__Recurring_Donation__r.Committed_Giving_ID__c': `${x.PrimKey}${x.CardMasterID}`,
        Amount,
        RecordTypeId: 'Individual Giving',
        Donation_Type__c: 'General Giving',
        StageName: 'Closed Won',
        npsp__Acknowledgment_Status__c: x.Status === 'Paid' ? 'Acknowledged' : x.Status,
        CC_Type__c: x.CCType,
        Transaction_Reference_Id__c: x.TransactionReference,
        //CloseDate: x.SettlementDate,
        CloseDate: x.CreatedDate ? state.formatDate(x.CreatedDate) : state.formatDate(x.SettlementDate),

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

fn(state => {
  return query(
    `Select Id, CloseDate FROM Opportunity 
    WHERE npe03__Recurring_Donation__r.Committed_Giving_ID__c in ('${state.selectIDs.join('", "')}')`
  )(state).then(state => {
    const { records } = state.references[0];
    const SFMonth = records.map(rec => rec.CloseDate.split('-')[1]);
    const SFYear = records.map(rec => rec.CloseDate.split('-')[0]);

    const transactionsToUpdate = state.TransactionsToMatch.filter(
      t => SFMonth.includes(t['Transaction Date'].split('/')[1]) && SFYear.includes(t['Transaction Date'].split('/')[2])
    );
    const transactionsToCreate = state.TransactionsToMatch.filter(
      t =>
        !SFMonth.includes(t['Transaction Date'].split('/')[1]) || !SFYear.includes(t['Transaction Date'].split('/')[2])
    );

    return { ...state, transactionsToUpdate, transactionsToCreate };
  });
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
    console.log('Bulk upserting new Opportunities without match.');
    return state.transactionsToCreate.map(x => {
      const Amount = x.Amount ? x.Amount.replace(/\£/g, '') : x.Amount;
      return {
        StageName: 'Closed Won',
        Committed_Giving_ID__c: `${x.PrimKey}${x.CardMasterID}${x.TransactionReference}`,
        Amount,
        CloseDate: x['Transaction Date'],
        'npe03__Recurring_Donation__r.Committed_Giving_ID__c': `${x.PrimKey}${x.CardMasterID}`,
      };
    });
  }
);

bulk(
  'Opportunity',
  'upsert',
  {
    extIdField: 'Committed_Giving_ID__c',
    failOnError: true,
    allowNoOp: true,
  },
  state => {
    console.log('Bulk upserting new Opportunities with match.');
    return state.transactionsToUpdate.map(x => {
      const Amount = x.Amount ? x.Amount.replace(/\£/g, '') : x.Amount;
      return {
        StageName: 'Closed Won',
        Committed_Giving_ID__c: `${x.PrimKey}${x.CardMasterID}${x.TransactionReference}`,
      };
    });
  }
);

fn(state => {
  return { ...state, opportunities: [] };
});
