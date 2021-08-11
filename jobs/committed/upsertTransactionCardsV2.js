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

  let arrayReduced = reduceArray(state.data.json, 'CardMasterID');
  const groupedCardMaster = [];
  for (key in arrayReduced) groupedCardMaster.push(arrayReduced[key]);

  let cardMasterIDLessThan1 = groupedCardMaster.filter(x => x.length <= 1);

  cardMasterIDLessThan1 = flattenArray(cardMasterIDLessThan1).filter(x => {
    const Amount = x.Amount && isNaN(x.Amount[0]) ? x.Amount.substring(1) : x.Amount;
    return Number(Amount) % 22 !== 0;
  });

  const cgIDLess1s = cardMasterIDLessThan1.map(cm => cm.CardMasterID);

  const cardMasterIDGreaterThan1 = state.data.json
    .filter(x => !cgIDLess1s.includes(x.CardMasterID))
    .filter(x => {
      const Amount = x.Amount && isNaN(x.Amount[0]) ? x.Amount.substring(1) : x.Amount;
      return Number(Amount) % 22 !== 0;
    });

  const transactionsToMatch = state.data.json.filter(x => !cgIDLess1s.includes(x.CardMasterID));

  const selectIDs = transactionsToMatch.map(x => `${x.PrimKey}${x.CardMasterID}`);

  return {
    ...state,
    cardMasterIDLessThan1,
    cardMasterIDGreaterThan1,
    transactionsToMatch,
    selectIDs,
    formatDate,
  };
});

query(
  state => `Select Id, CloseDate, Campaign.Source_Code__c FROM Opportunity
  WHERE npe03__Recurring_Donation__r.Committed_Giving_ID__c in
  ('${state.selectIDs.join('", "')}')`
);

fn(state => {
  const { cardMasterIDGreaterThan1, cardMasterIDLessThan1, transactionsToMatch } = state;
  const { records } = state.references[0];
  const SFMonth = records.map(rec => rec.CloseDate.split('-')[1]);
  const SFYear = records.map(rec => rec.CloseDate.split('-')[0]);
  const SFcampaign = records.map(rec => rec['Campaign.Source_Code__c']);

  const selectGivingId = x => `${x.PrimKey}${x.CardMasterID}${x.TransactionReference}`;

  const selectAmount = item => {
    if (item.Amount) {
      return isNaN(item.Amount) ? item.Amount.replace(/[^-.0-9]/g, '') : parseInt(item.Amount);
    }
    return undefined;
  };

  const recurringDonations = cardMasterIDGreaterThan1.map(x => ({
    Committed_Giving_ID__c: selectGivingId(x),
    'npe03__Contact__r.Committed_Giving_ID__c': x.PrimKey,
    Credit_Card_Type__c: x.CCType,
    Type__c: 'Recurring Donation',
    'npe03__Recurring_Donation_Campaign__r.Source_Code__c': 'UKRG',
    npe03__Amount__c: selectAmount(x),
    npsp__PaymentMethod__c: 'Credit Card'
  }));

  // 1st type of opportunities in this array ==> Regular once-off donations to insert
  const transactionLessThan1 = cardMasterIDLessThan1.map(x => ({
    Name: x.TransactionReference,
    Committed_Giving_ID__c: selectGivingId(x),
    'npsp__Primary_Contact__r.Committed_Giving_ID__c': x.PrimKey,
    //'npe03__Recurring_Donation__r.Committed_Giving_ID__c': `${x.PrimKey}${x.CardMasterID}`,
    Amount: selectAmount(x),
    Payment_Type__c: selectAmount(x) < 0 ? 'Refund' : 'Payment',
    'RecordType.Name': 'Individual Giving',
    Donation_Type__c: 'General Giving',
    StageName: 'Closed Won',
    npsp__Acknowledgment_Status__c: x.Status === 'Paid' ? 'Acknowledged' : x.Status,
    CC_Type__c: x.CCType,
    Transaction_Reference_Id__c: x.TransactionReference,
    //CloseDate: x.SettlementDate,
    CloseDate: x.CreatedDate ? state.formatDate(x.CreatedDate) : state.formatDate(x.SettlementDate),
    Method_of_Payment__c: 'Credit',
    CG_Credit_Card_ID__c: x.CardTransId,
    'Campaign.Source_Code__c': 'UKWEB',
  }));

  // 2nd type of opportunity in this array ==> Opportunities linked to Recurring Donations
  const transactionsToUpdate = transactionsToMatch
    .filter(
      t => SFMonth.includes(t['Transaction Date'].split('/')[1]) && SFYear.includes(t['Transaction Date'].split('/')[2])
    )
    .map(x => ({
      StageName: 'Closed Won',
      Method_of_Payment__c: 'Credit',
      Amount: selectAmount(x),
      Payment_Type__c: selectAmount(x) < 0 ? 'Refund' : 'Payment',
      CloseDate: x.CreatedDate ? state.formatDate(x.CreatedDate) : state.formatDate(x.SettlementDate),
      Committed_Giving_ID__c: selectGivingId(x),
      CG_Credit_Card_ID__c: x.CardTransId,
      //'Campaign.Source_Code__c': 'CODE', //TODO: Amount = multiple of 22 ? 'UKSPCC' : 'UKRG'; 
    }));

  // 3rd type of opportunity in this array ==> New Opportunities to insert related to Recurring Donations
  const transactionsToCreate = transactionsToMatch
    .filter(
      t =>
        !SFMonth.includes(t['Transaction Date'].split('/')[1]) || !SFYear.includes(t['Transaction Date'].split('/')[2])
    )
    .map(x => {
      return {
        Name: x.TransactionReference,
        'npsp__Primary_Contact__r.Committed_Giving_ID__c': x.PrimKey,
        StageName: 'Closed Won',
        Committed_Giving_ID__c: selectGivingId(x),
        Amount: selectAmount(x),
        Payment_Type__c: selectAmount(x) < 0 ? 'Refund' : 'Payment',
        CloseDate: x['Transaction Date'] ? state.formatDate(x['Transaction Date']) : undefined,
        Method_of_Payment__c: 'Credit',
        CG_Credit_Card_ID__c: x.CardTransId,
        'Campaign.Source_Code__c': 'UKWEB',
        'npe03__Recurring_Donation__r.Committed_Giving_ID__c': `${x.PrimKey}${x.CardMasterID}`, //Q: Can we assume there will always be a RD? Do we need to create the RD?
      };
    });

  console.log('Count of "Less than 1" opportunities:', transactionLessThan1.length);
  console.log('Count of "To create" opportunities:', transactionsToCreate.length);
  console.log('Count of "To update" opportunities:', transactionsToUpdate.length);

  return {
    ...state,
    recurringDonations,
    transactions: [...transactionLessThan1, ...transactionsToCreate, ...transactionsToUpdate],
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
  state => state.transactions
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
    return state.recurringDonations;
  }
);
