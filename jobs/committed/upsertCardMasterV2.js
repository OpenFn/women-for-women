fn(state => {
  const json = state.data.json.filter(x => x.PrimKey);
  return { ...state, data: { ...state.data, json } };
});

fn(state => {
  const formatDate = date => {
    if (!date) return null;
    date = date.split(' ')[0];
    const parts = date.match(/(\d+)/g);
    const year = parts !== null ? (String(parts[2]).length > 2 ? parts[2] : `20${parts[2]}`) : parts;
    return parts ? new Date(Number(year), parts[1] - 1, parts[0]).toISOString() : parts;
  };

  const selectAmount = item => {
    if (item.Amount) {
      return isNaN(item.Amount) ? item.Amount.replace(/[^-.0-9]/g, '').replace(/�5/g, '') : parseInt(item.Amount);
    }
    return undefined;
  };

  const increaseMonth = date => {
    let dateEstablished = formatDate(date);
    const month = new Date(dateEstablished).getUTCMonth();
    dateEstablished = new Date(dateEstablished).setUTCMonth(month + 1);
    return new Date(dateEstablished).toISOString();
  };

  const increaseYear = date => {
    let dateEstablished = formatDate(date);
    const year = new Date(dateEstablished).getUTCFullYear();
    dateEstablished = new Date(dateEstablished).setUTCFullYear(year + 1);
    return new Date(dateEstablished).toISOString();
  };

  const checkMonth = date => {
    if (!date || date === '0000') return undefined;
    const month = date.substring(0, 2);
    return month;
  };

  const checkYear = date => {
    if (!date || date === '0000') return undefined;
    const year = date.substring(3);
    return year;
  };

  const checkActiveInactiveStatus = x => {
    // 1. If csv.RecurringCancelDate defined, then sf.Active__c: false
    if (x.RecurringCancelDate) return false;
    // 2. If csv.RecurringCancelDate not defined, then check csv.LastCredited as follows:
    if (!x.RecurringCancelDate) {
      // a. If csv.LastCredited not defined && csv.Occurrence also not defined OR None, then sf.Active__c: false.
      // b. If csv.LastCredited not defined && csv.Occurrence = Monthly OR Yearly, then sf.Active__c: false.
      if (!x.LastCredited && !x.NextDate && (!x.Occurrence || x.Occurrence === 'None')) return false;

      // c. If csv.LastCredited is defined... check if date is older than 3 months from today (csv.LastCredited < (today - 3months) == true). If older, return Active__c: false.
      if (x.LastCredited && new Date(x.LastCredited) < new Date(new Date().setMonth(new Date().getMonth() - 3)))
        return false;
      // d. If csv.LastCredited is defined... check if date is NOT older than 3 months from today (csv.LastCredited < (today - 3months) == false). If not older than 3mo, then return Active__c: true.
      if (x.LastCredited && new Date(x.LastCredited) >= new Date(new Date().setMonth(new Date().getMonth() - 3)))
        return true;

      //e. if no LastCredited date, but occurrnece is defined...then active = true
      if (!x.LastCredited && (x.Occurrence === 'Monthly' || x.Occurrence === 'Yearly')) return true;
    }
  };

  const checkNpspActiveInactiveStatus = x => {
    // 1. If csv.RecurringCancelDate defined, then sf.Active__c: false
    if (x.RecurringCancelDate) return 'Closed';
    // 2. If csv.RecurringCancelDate not defined, then check csv.LastCredited as follows:
    if (!x.RecurringCancelDate) {
      // a. If csv.LastCredited not defined && csv.Occurrence also not defined OR None, then sf.Active__c: false.
      // b. If csv.LastCredited not defined && csv.Occurrence = Monthly OR Yearly, then sf.Active__c: false.
      if (!x.LastCredited && (!x.Occurrence || x.Occurrence === 'None')) return 'Lapsed';

      // c. If csv.LastCredited is defined... check if date is older than 3 months from today (csv.LastCredited < (today - 3months) == true). If older, return Active__c: false.
      if (x.LastCredited && new Date(x.LastCredited) < new Date(new Date().setMonth(new Date().getMonth() - 3)))
        return 'Lapsed';
      // d. If csv.LastCredited is defined... check if date is NOT older than 3 months from today (csv.LastCredited < (today - 3months) == false). If not older than 3mo, then return Active__c: true.
      if (x.LastCredited && new Date(x.LastCredited) >= new Date(new Date().setMonth(new Date().getMonth() - 3)))
        return 'Active';
      //e. if no LastCredited date, but occurrnece is defined...then active = true
      if (!x.LastCredited && (x.Occurrence === 'Monthly' || x.Occurrence === 'Yearly')) return 'Active';
    }
  };

  const baseMapping = x => {
    return {
      Committed_Giving_ID__c: `${x.PrimKey}${x.CardMasterID}`,
      CG_Credit_Card_ID__c: x.CardMasterID,
      Name: x.CardMasterID,
      'npe03__Contact__r.Committed_Giving_Id__c': x.PrimKey,
      npe03__Installment_Period__c: Number(selectAmount(x)) % 264 === 0 ? 'Yearly' : 'Monthly',
      npe03__Amount__c: x.Amount.replace(/�/, ''),
      Closeout_Date__c: x.RecurringCancelDate ? formatDate(x.RecurringCancelDate) : x.RecurringCancelDate,
      Closeout_Reason__c: x.RecurringCancelReason,
      //Active__c: checkActiveInactiveStatus(x), //Nov 2022 Request: To not uncheck Active, only add Closeout Date
      npsp__Status__c: checkNpspActiveInactiveStatus(x),
      npsp__PaymentMethod__c: 'Credit Card',
      npe03__Date_Established__c: formatDate(x.AddedDateTime),
      npsp__StartDate__c: increaseMonth(x.AddedDateTime),
      npe03__Next_Payment_Date__c: !x.RecurringCancelDate
        ? Number(selectAmount(x)) % 264 === 0
          ? formatDate(x.NextDate)
          : x.LastCredited && x.LastCredited != ''
          ? increaseMonth(x.LastCredited)
          : undefined
        : undefined, //Note: This is required to trigger auto-insert of related Opps
      of_Sisters_Requested__c:
        Number(selectAmount(x)) % 264 === 0
          ? Math.abs(Number(selectAmount(x)) / 264)
          : Math.abs(Number(selectAmount(x)) / 22),
      Expiration_Month__c: checkMonth(x.CCExpiry), //Parse month; SF expects text, but output should still be a number like '2' for February
      Expiration_Year__c: checkYear(x.CCExpiry), //Parse year; SF expects integer like '2021'
    };
  };

  // Filter all csv rows that have Amount (x.Amount) that is a multiple of 22
  const multipleOf22 = state.data.json.filter(x => Number(selectAmount(x)) % 22 === 0);

  const sponsorships = multipleOf22.map(x => {
    return {
      ...baseMapping(x),
      ...{
        Type__c: 'Sponsorship',
        'npe03__Recurring_Donation_Campaign__r.Source_Code__c': 'UKSPCC',
        'Sponsor__r.Committed_Giving_Id__c': x.PrimKey,
      },
    };
  });

  const multipleOf22IDs = multipleOf22.map(x => x.Name);

  const donations = state.data.json
    .filter(x => !multipleOf22IDs.includes(x.CardMasterID))
    .filter(
      x =>
        (x.Occurrence === 'Monthly' && x.LastCredited !== 'MISSING') ||
        (x.Occurrence === 'Yearly' && x.LastCredited !== 'MISSING') ||
        (x.Occurrence === 'None' && x.LastCredited !== 'MISSING' && x.RecurringCancelDate !== null)
    )
    .map(x => {
      return {
        ...baseMapping(x),
        ...{
          Type__c: Number(selectAmount(x)) % 22 === 0 ? 'Sponsorship' : 'Recurring Donation',
          'npe03__Recurring_Donation_Campaign__r.Source_Code__c':
            Number(selectAmount(x)) % 22 === 0 ? 'UKSPCC' : 'UKRG',
        },
      };
    });

  return { ...state, sponsorships, donations, formatDate };
});

bulk(
  'npe03__Recurring_Donation__c',
  'upsert',
  {
    extIdField: 'Committed_Giving_ID__c',
    failOnError: false,
    allowNoOp: true,
  },
  state => {
    console.log('Bulk upserting Sponsorship.');
    return state.sponsorships;
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
    console.log('Bulk upserting donations.');
    return state.donations;
  }
);

fn(state => {
  // lighten state
  return { ...state, sponsorships: [], donations: [] };
});
