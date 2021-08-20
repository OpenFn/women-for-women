alterState(state => {
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

  const opportunities = state.data.json.map(x => ({ ...x, cgID: `${x.PrimKey}${x.DDRefforBank}${x['Date']}` }));

  const donations = state.data.json.filter(x => {
    return Number(selectAmount(x)) % 22 === 0;
  });

  const cgIDs = opportunities.map(o => `'${o.cgID}'`);

  return { ...state, opportunities, donations, cgIDs, formatDate, selectAmount };
});

bulk(
  'Opportunity', // the sObject
  'upsert', // TODO: either upsert OR update depending on if an Opportunity for that Transaction Date already exists
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
        return {
          Committed_Giving_ID__c: `${x.PrimKey}${x.DDId}${x.DDRefforBank}${x.Date}`,
          'npsp__Primary_Contact__r.Committed_Giving_ID__c': `${x.PrimKey}`,
          'Account.Committed_Giving_ID__c': `${x.PrimKey}`,
          Amount: state.selectAmount(x),
          CurrencyIsoCode: 'GBP',
          StageName: 'Closed Won',
          CloseDate: state.formatDate(x['Date']),
          Transaction_Date_Time__c: state.formatDate(x['Date']),
          npsp__Closed_Lost_Reason__c: x['Unpaid reason'], //Map from DirectDebit? 
          'Campaign.Source_Code__c': x['PromoCode'],
          Name: x.DDRefforBank,
          Donation_Type__c: x['TransType'] === 'Sponsorship' ? 'Sponsorship' : 'Recurring Donation',
          Payment_Type__c: state.selectAmount(x) > 0 ? 'Payment' : 'Refund', //REFUND IF negative amount
          'npe03__Recurring_Donation__r.Committed_Giving_ID__c': `${x.PrimKey}${x.DDId}`,
          Method_of_Payment__c: 'Debit',
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
          Committed_Giving_ID__c: `${x.PrimKey}${x.DDId}`,
          Committed_Giving_Direct_Debit_Reference__c: x.DDRefforBank,
          of_Sisters_Requested__c: Number(x.Amount) / 22,
        };
      });
  }
);

alterState(state => {
  // lighten state
  return { ...state, opportunities: [], cgIDs: {} };
});
