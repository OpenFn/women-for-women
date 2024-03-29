fn(state => {
  const json = state.data.json.filter(x => x.DDId || x.DDid);
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

  const selectIDs = state.data.json.map(x => `${x.PrimKey}${x.DDId || x.DDid}`);

  return {
    ...state,
    selectIDs,
    formatDate,
    selectAmount,
  };
});

fn(state => {
  const cleanDate = date => {
    if (!date) return undefined;
    date = date.replace(/[:\/]/g, '');
    return date.replace(/\s+/g, '');
  };

  const selectGivingId = x => `${x.PrimKey}${x.DDId || x.DDid}${x.DDRefforBank}${cleanDate(x.Date)}`;
  const formatDateYMD = inputDate => {
    // Split the input date string into date and time parts
    const datePart = inputDate.split(' ')[0];
    // Split the date part into day, month, and year
    const [day, month, year] = datePart.split('/');

    return year + '-' + month + '-' + day;
  };
  const baseMapping = x => {
    return {
      Committed_Giving_ID__c: selectGivingId(x),
      CG_Pledged_Donation_ID__c: `${x.DDid}_${formatDateYMD(x.Date)}_Pledged`,
      'npsp__Primary_Contact__r.Committed_Giving_ID__c': `${x.PrimKey}`,
      Amount: state.selectAmount(x),
      CurrencyIsoCode: 'GBP',
      StageName: x.Status === 'Unpaid' ? 'Closed Lost' : 'Closed Won',
      CloseDate: state.formatDate(x['Date']),
      Transaction_Date_Time__c: state.formatDate(x['Date']),
      'Campaign.Source_Code__c': x['PromoCode'] || 'UKWEB',
      Name: x.DDRefforBank,
      Donation_Type__c: x['TransType'] === 'Sponsorship' ? 'Sponsorship' : 'Recurring Donation',
      Payment_Type__c: state.selectAmount(x) > 0 ? 'Payment' : 'Refund',
      'npe03__Recurring_Donation__r.Committed_Giving_ID__c': `${x.PrimKey}${x.DDId || x.DDid}`,
      Method_of_Payment__c: 'Direct Debit',
      E_mail_Mailing_ID__c: x.EmailMailingID,
      Campaign_name__c: x.Campaign,
      Campaign_Source__c: x.CampaignSource,
      Campaign_Content__c: x.CampaignContent,
      Campaign_Medium__c: x.CampaignMedium,
    };
  };

  const opportunities = state.data.json.map(x => {
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
    extIdField: 'CG_Pledged_Donation_ID__c',
    failOnError: false,
    allowNoOp: true,
  },
  state => state.opportunities
);

fn(state => {
  const errors = state.references
    .flat()
    .filter(item => !item.success)
    .map(er => er.errors)
    .flat();

  const checkDupError = errors.filter(
    err =>
      err.includes('DUPLICATE_VALUE:duplicate value found: Committed_Giving_ID__c') ||
      err.includes('DUPLICATE_VALUE:duplicate value found: CG_Pledged_Donation_ID__c')
  );

  if (errors.length > 0) {
    if (errors.length === checkDupError.length) {
      console.log('Ingoring DUPLICATE_VALUE:duplicate value found');
    } else {
      throw new Error('Errors detected, scroll up to see the resutls');
    }
  }
  // lighten state
  return { ...state, opportunities: [] };
});
