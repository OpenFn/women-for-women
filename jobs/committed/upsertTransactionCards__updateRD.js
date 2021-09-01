// Note that we get _almost_ entirely empty records in the initial state.
// We are assuming that they should be silently discarded. Is this the case?
fn(state => {
  const json = state.data.json.filter(x => x.CardMasterID);
  return { ...state, data: { ...state.data, json } };
});

fn(state => {
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

  let cardMasterIDLessThan1 = groupedCardMaster.filter(x => x.length <= 1);

  cardMasterIDLessThan1 = flattenArray(cardMasterIDLessThan1).filter(x => {
    const Amount = x.Amount && isNaN(x.Amount[0]) ? x.Amount.substring(1) : x.Amount;
    return Number(Amount) % 22 !== 0;
  });

  const cgIDLess1s = cardMasterIDLessThan1.map(cm => cm.CardMasterID);

  const transactionsToMatch = state.data.json.filter(x => !cgIDLess1s.includes(x.CardMasterID));

  const selectIDs = transactionsToMatch.map(x => `${x.PrimKey}${x.CardMasterID}`);

  return {
    ...state,
    transactionsToMatch,
    selectIDs,
    //formatDate,
  };
});

// query(
//     state => `Select Id, CloseDate, Campaign.Source_Code__c FROM Opportunity
//     WHERE npe03__Recurring_Donation__r.Committed_Giving_ID__c in
//     ('${state.selectIDs.join("', '")}')`
// );

fn(state => {
  const { transactionsToMatch } = state;
  //const { records } = state.references[0];

  const selectGivingId = x => `${x.PrimKey}${x.CardMasterID}${x.CardTransId}`;

  // const selectAmount = item => {
  //     if (item.Amount) {
  //         return isNaN(item.Amount) ? item.Amount.replace(/[^-.0-9]/g, '') : parseInt(item.Amount);
  //     }
  //     return undefined;
  // };
  // const multipleOf22 = item => Number(selectAmount(item)) % 22 === 0;

  // 2nd type of opportunity in this array ==> Opportunities linked to Recurring Donations
  const transactionsToUpsert = transactionsToMatch.map(x => ({
    Committed_Giving_ID__c: selectGivingId(x),
    'npe03__Recurring_Donation__r.Committed_Giving_ID__c': `${x.PrimKey}${x.CardMasterID}`,
  }));

  console.log('Count of Opp to upsert with RD lookup:', transactionsToUpsert.length);

  return {
    ...state,
    transactions: [...transactionsToUpsert],
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
    console.log('Bulk upserting Opps.', state.transactions);
    return state.transactions;
  }
);