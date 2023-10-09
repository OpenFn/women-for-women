// Note that we get _almost_ entirely empty records in the initial state.
// If empty rows, we are assuming that they should be silently discarded.
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

  let cardMasterIDLessThan1 = groupedCardMaster.filter(x => x.length <= 1); //Changed from: x => x.length <= 1

  cardMasterIDLessThan1 = flattenArray(cardMasterIDLessThan1);

  const cgIDLess1s = cardMasterIDLessThan1.map(cm => cm.CardMasterID);

  const cardMasterIDGreaterThan1 = transactionsNotMultipleOf22.filter(x => !cgIDLess1s.includes(x.CardMasterID));

  return {
    ...state,
    transactionsMultipleOf22,
    cardMasterIDLessThan1,
    cardMasterIDGreaterThan1,
    formatDate,
    selectAmount,
    multipleOf22,
  };
});

fn(state => {
  const { cardMasterIDGreaterThan1, cardMasterIDLessThan1, transactionsMultipleOf22 } = state;

  const selectGivingId = x => `${x.PrimKey}${x.CardMasterID}${formatDateYMD(x['Transaction Date'])}`;

  const selectRDId = x => `${x.PrimKey}${x.CardMasterID}`;

  const formatDateYMD = inputDate => {
    // Split the input date string into date and time parts
    const datePart = inputDate.split(' ')[0];
    // Split the date part into day, month, and year
    const [day, month, year] = datePart.split('/');

    return year + '-' + month + '-' + day;
  };

  const opportunities = transactionsMultipleOf22.map(x => ({
    CG_Pledged_Donation_ID__c: `${x.CardMasterID}_${formatDateYMD(x['Transaction Date'])}_Pledged`,
    Name: x.TransactionReference,
    'npsp__Primary_Contact__r.Committed_Giving_ID__c': x.PrimKey,
    StageName: 'Closed Won',
    Committed_Giving_ID__c: selectGivingId(x),
    Amount: state.selectAmount(x),
    CurrencyIsoCode: 'GBP',
    Payment_Type__c: state.selectAmount(x) < 0 ? 'Refund' : 'Payment',
    CloseDate: x['Transaction Date'] ? state.formatDate(x['Transaction Date']) : undefined,
    Transaction_Date_Time__c: x['Transaction Date'] ? state.formatDate(x['Transaction Date']) : undefined,
    Method_of_Payment__c: 'Credit',
    CG_Credit_Card_ID__c: x.CardTransId,
    CG_Credit_Card_Master_ID__c: x.CardMasterID,
    'Campaign.Source_Code__c': x.PromoCode || 'UKWEB',
    'npe03__Recurring_Donation__r.Committed_Giving_ID__c': selectRDId(x),
    Donation_Type__c: state.multipleOf22(x) ? 'Sponsorship' : 'Recurring Donation',
    'RecordType.Name': 'Individual Giving',
  }));

  const recurringDonations = cardMasterIDGreaterThan1.map(x => {
    let npe03__Installment_Period__c = '';
    if ((state.multipleOf22(x) && state.selectAmount(x) < 264) || state.selectAmount(x) < 22) {
      npe03__Installment_Period__c = 'Monthly';
    } else if (state.selectAmount(x) > 22 && !state.multipleOf22(x)) {
      npe03__Installment_Period__c = 'Yearly';
    }
    return {
      Committed_Giving_ID__c: selectRDId(x),
      'npe03__Contact__r.Committed_Giving_ID__c': x.PrimKey,
      Type__c: 'Recurring Donation',
      'npe03__Recurring_Donation_Campaign__r.Source_Code__c': x.PromoCode,
      npe03__Amount__c: state.selectAmount(x),
      npsp__PaymentMethod__c: 'Credit Card',
      npe03__Date_Established__c: state.formatDate(x['Transaction Date']),
      npe03__Installment_Period__c,
      CG_Credit_Card_ID__c: x.CardMasterID,
    };
  });

  const uniqueRDs = Array.from(new Set(recurringDonations.map(x => x.CardMasterID))).map(CardMasterID => {
    return recurringDonations.find(c => CardMasterID === c.CardMasterID);
  });

  const transactionGreaterThan1 = cardMasterIDGreaterThan1.map(x => ({
    CG_Pledged_Donation_ID__c: `${x.CardMasterID}_${formatDateYMD(x['Transaction Date'])}_Pledged`,
    Name: x.TransactionReference,
    'npsp__Primary_Contact__r.Committed_Giving_ID__c': x.PrimKey,
    StageName: 'Closed Won',
    Committed_Giving_ID__c: selectGivingId(x),
    Amount: state.selectAmount(x),
    Payment_Type__c: state.selectAmount(x) < 0 ? 'Refund' : 'Payment',
    CloseDate: x['Transaction Date'] ? state.formatDate(x['Transaction Date']) : undefined,
    Method_of_Payment__c: 'Credit',
    CG_Credit_Card_ID__c: x.CardTransId,
    CG_Credit_Card_Master_ID__c: x.CardMasterID,
    'Campaign.Source_Code__c': x.PromoCode,
    'npe03__Recurring_Donation__r.Committed_Giving_ID__c': `${x.PrimKey}${x.CardMasterID}`,
    Donation_Type__c: state.multipleOf22(x) ? 'Sponsorship' : 'Recurring Donation',
    'RecordType.Name': 'Individual Giving',
  }));

  // 1st type of opportunities in this array ==> Regular once-off OR recurring donations to insert
  const transactionLessThan1 = cardMasterIDLessThan1.map(x => ({
    CG_Pledged_Donation_ID__c: `${x.CardMasterID}_${formatDateYMD(x['Transaction Date'])}_Pledged`,
    Name: x.TransactionReference,
    Committed_Giving_ID__c: selectGivingId(x),
    'npsp__Primary_Contact__r.Committed_Giving_ID__c': x.PrimKey,
    Amount: state.selectAmount(x),
    Payment_Type__c: state.selectAmount(x) < 0 ? 'Refund' : 'Payment',
    'RecordType.Name': 'Individual Giving',
    Donation_Type__c: x.CampaignCode === 'Regular Giving' ? 'Recurring Donation' : 'General Donation',
    StageName: 'Closed Won',
    npsp__Acknowledgment_Status__c: x.Status === 'Paid' ? 'Acknowledged' : x.Status,
    Transaction_Reference_Id__c: x.TransactionReference,
    CloseDate: x.CreatedDate ? state.formatDate(x.CreatedDate) : state.formatDate(x.SettlementDate),
    Method_of_Payment__c: 'Credit',
    CG_Credit_Card_ID__c: x.CardTransId,
    CG_Credit_Card_Master_ID__c: x.CardMasterID,
    'Campaign.Source_Code__c': x.PromoCode,
    Transaction_Date_Time__c: state.formatDate(x['Transaction Date']),
    'npe03__Recurring_Donation__r.Committed_Giving_ID__c':
      x.CampaignCode === 'Regular Giving' ? `${x.PrimKey}${x.CardMasterID}` : undefined,
    'RecordType.Name': 'Individual Giving',
  }));

  console.log('Count of new "RDs" to upsert:', uniqueRDs.length);
  console.log('Count of "Less than 1" Opps to upsert:', transactionLessThan1.length);
  console.log('Count of "RD Opps" to upsert:', opportunities.length);
  console.log('Count of "Recurring Opps" to upsert:', transactionGreaterThan1.length);

  return {
    ...state,
    uniqueRDs,
    transactions: [...transactionLessThan1, ...opportunities, ...transactionGreaterThan1],
  };
});

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
    return state.uniqueRDs;
  }
);

bulk(
  'Opportunity',
  'upsert',
  {
    extIdField: 'CG_Pledged_Donation_ID__c',
    failOnError: false,
    allowNoOp: true,
  },
  state => {
    console.log('Bulk upserting Opps.');
    return state.transactions;
  }
);

fn(state => {
  const errors = state.references.flat().filter(item => !item.success);

  const checkDupError = errors.map(err =>
    err.errors.includes('DUPLICATE_VALUE:duplicate value found: Committed_Giving_ID__c')
  );

  if (errors.length > 0) {
    if (errors.length === checkDupError.length) {
      console.log('Ingoring DUPLICATE_VALUE:duplicate value found');
    } else {
      console.error('Errors detected:');
      throw new Error(JSON.stringify(errors, null, 2));
    }
  }

  return state;
});
