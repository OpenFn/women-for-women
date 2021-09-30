// Note that we get _almost_ entirely empty records in the initial state.
// We are assuming that they should be silently discarded. Is this the case?
fn(state => {
  const json = state.data.json.filter(x => x.CardMasterID);
  return { ...state, data: { ...state.data, json } };
});

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

  const selectAmount = item => {
    if (item.Amount) {
      return isNaN(item.Amount) ? item.Amount.replace(/[^-.0-9]/g, '') : parseInt(item.Amount);
    }
    return undefined;
  };

  const multipleOf22 = item => Number(selectAmount(item)) % 22 === 0;

  // We build arrays of transactions with amount multiple of 22 and not multiple.
  const transactionsMultipleOf22 = state.data.json.filter(x => multipleOf22(x));
  const transactionsNotMultipleOf22 = state.data.json.filter(x => !multipleOf22(x));

  // We group transactions by 'CardMasterID'
  let arrayReduced = reduceArray(transactionsNotMultipleOf22, 'CardMasterID');
  const groupedCardMaster = [];
  for (key in arrayReduced) groupedCardMaster.push(arrayReduced[key]);

  let cardMasterIDLessThan1 = groupedCardMaster.filter(x => x.length <= 1);

  cardMasterIDLessThan1 = flattenArray(cardMasterIDLessThan1);

  const cgIDLess1s = cardMasterIDLessThan1.map(cm => cm.CardMasterID);

  const cardMasterIDGreaterThan1 = transactionsNotMultipleOf22.filter(x => !cgIDLess1s.includes(x.CardMasterID));

  const cardMasterRecurring = transactionsNotMultipleOf22.filter(x => x.CampaignCode !== 'Sponsorship');

  return {
    ...state,
    transactionsMultipleOf22,
    cardMasterIDLessThan1,
    cardMasterIDGreaterThan1,
    cardMasterRecurring,
    formatDate,
    selectAmount,
    multipleOf22,
  };
});

fn(state => {
  const { cardMasterIDGreaterThan1, cardMasterIDLessThan1, transactionsMultipleOf22, cardMasterRecurring } = state;

  const selectGivingId = x => `${x.PrimKey}${x.CardMasterID}${x.CardTransId}`;

  const sponsorsToUpsert = transactionsMultipleOf22.map(x => ({
    Committed_Giving_ID__c: selectGivingId(x),
    'npe03__Recurring_Donation__r.Committed_Giving_ID__c': `${x.PrimKey}${x.CardMasterID}`,
  }));

  const transactionsToUpsert = cardMasterIDGreaterThan1.map(x => ({
    Committed_Giving_ID__c: selectGivingId(x),
    'npe03__Recurring_Donation__r.Committed_Giving_ID__c': `${x.PrimKey}${x.CardMasterID}`,
  }));

  const transactionsRecurring = cardMasterRecurring.map(x => ({
    Committed_Giving_ID__c: selectGivingId(x),
    'npe03__Recurring_Donation__r.Committed_Giving_ID__c': `${x.PrimKey}${x.CardMasterID}`,
  }));

  console.log('Count of RD Opps to upsert with RD lookup:', transactionsToUpsert.length);
  console.log('Count of Sponsor Opps to upsert with RD lookup:', sponsorsToUpsert.length);
  console.log('Count of Recurring Donations to upsert with RD lookup:', transactionsRecurring.length);



  return {
    ...state,
    transactions: [...transactionsToUpsert, ...sponsorsToUpsert, ...transactionsRecurring],
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