fn(state => {
  const json = state.data.json.filter(x => x.DDId);
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

  const selectAmount = item => {
    if (item.Amount) {
      return isNaN(item.Amount) ? item.Amount.replace(/[^-.0-9]/g, '') : parseInt(item.Amount);
    }
    return undefined;
  };

  const selectIDs = state.data.json.map(x => `${x.PrimKey}${x.DDId}`);

  return {
    ...state,
    selectIDs,
    formatDate,
    selectAmount,
  };
});


fn(state => {
  const selectGivingId = x => `${x.PrimKey}${x.DDId}${x.DDRefforBank}${x.Date}`;

  const baseMapping = x => {
    return {
      Committed_Giving_ID__c: selectGivingId(x).replace(/-\//g, ''),
      'npsp__Primary_Contact__r.Committed_Giving_ID__c': `${x.PrimKey}`,
      //'Account.Committed_Giving_ID__c': `${x.PrimKey}`, //Q: SHOULD WE MAP ACCTS?
      Amount: state.selectAmount(x),
      CurrencyIsoCode: 'GBP',
      StageName: 'Closed Won',
      CloseDate: state.formatDate(x['Date']),
      Transaction_Date_Time__c: state.formatDate(x['Date']),
      npsp__Closed_Lost_Reason__c: x['Unpaid reason'], //Q: Map from DirectDebit?
      'Campaign.Source_Code__c': x['PromoCode'],
      Name: x.DDRefforBank,
      Donation_Type__c: x['TransType'] === 'Sponsorship' ? 'Sponsorship' : 'Recurring Donation',
      Payment_Type__c: state.selectAmount(x) > 0 ? 'Payment' : 'Refund',
      'npe03__Recurring_Donation__r.Committed_Giving_ID__c': `${x.PrimKey}${x.DDId}`,
      Method_of_Payment__c: 'Direct Debit',
    };
  };

  const opportunities = state.data.json
    // .filter(o => state.selectIDs.includes(`${o.PrimKey}${o.DDId}`))
    .map(x => {
      return {
        ...baseMapping(x),
      };
    });

  console.log('Count of opportunities:', opportunities.length);

  return { ...state, opportunities };
});


bulk(
  'Opportunity',
  'upsert',
  {
    extIdField: 'Committed_Giving_ID__c',
    failOnError: true,
    allowNoOp: true,
  },
  state => state.opportunities
);

alterState(state => {
  // lighten state
  return { ...state, opportunities: [] };
});
