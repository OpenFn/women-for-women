fn(state => {
  const formatDate = date => {
    if (!date || date === 'NULL') return null;
    date = date.split(' ')[0];
    const parts = date.match(/(\d+)/g);
    const year = String(parts[2]).length > 2 ? parts[2] : `20${parts[2]}`;
    return parts ? new Date(Number(year), parts[1] - 1, parts[0]).toISOString() : parts;
  };

  const parseCustomDate = dateString => {
    const [day, month, year, time] = dateString.split(/[\s/]/);
    const [hours, minutes, seconds] = time.split(':');

    return new Date(year, month - 1, day, hours, minutes, seconds);
  };

  const selectAmount = item => {
    if (item['Amount']) {
      return isNaN(item['Amount']) ? item['Amount'].replace(/[^-.0-9]/g, '') : parseInt(item['Amount']);
    }
    return undefined;
  };

  const increaseMonth = date => {
    let dateEstablished = formatDate(date);
    const month = new Date(dateEstablished).getUTCMonth();
    dateEstablished = new Date(dateEstablished).setUTCMonth(month + 1);
    return new Date(dateEstablished).toISOString();
  };

  const formatEmpty = item => (item === '' ? undefined : item);

  const addDaysToDate = (inputDate, daysToAdd) => {
    const startDate = new Date(inputDate);

    const endDate = startDate.setDate(startDate.getDate() + daysToAdd);

    return new Date(endDate);
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

  const mapCancelDate = (cancelDate, paymentFrequency, lastClaimDate) => {
    switch (paymentFrequency) {
      case 'Monthly':
        return formatDate(cancelDate);

      case 'Yearly':
        const add364Days = addDaysToDate(parseCustomDate(lastClaimDate), 364);
        return add364Days.toISOString();

      case 'Semi Annually':
        const add181Days = addDaysToDate(parseCustomDate(lastClaimDate), 181);
        return add181Days.toISOString();

      case 'SemiAnnually':
        return add181Days.toISOString();

      case 'Quarterly':
        const add90Days = addDaysToDate(parseCustomDate(lastClaimDate), 90);
        return add90Days.toISOString();

      default:
        return formatDate(cancelDate);
    }
  };

  const checkNpspActiveInactiveStatus = x => {
    // 1. If csv.RecurringCancelDate defined, then sf.Active__c: false
    if (x.RecurringCancelDate) return 'Closed';
    // 2. If csv.RecurringCancelDate not defined, then check csv.LastCredited as follows:
    if (!x.RecurringCancelDate) {
      // a. If csv.LastCredited not defined && csv.Occurrence also not defined OR None, then 'Lapsed'.
      // b. If csv.LastCredited not defined && csv.Occurrence = Monthly OR Yearly, then 'Lapsed'
      if (!x.LastCredited && !x.NextDate && (!x.Occurrence || x.Occurrence === 'None')) return 'Lapsed';

      // c. If csv.LastCredited is defined... check if date is older than 3 months from today (csv.LastCredited < (today - 3months) == true). If older, return Active__c: false.
      if (
        !x.NextDate &&
        x.LastCredited &&
        new Date(x.LastCredited) < new Date(new Date().setMonth(new Date().getMonth() - 3))
      )
        return 'Lapsed';
      // d. If csv.LastCredited is defined... check if date is NOT older than 3 months from today (csv.LastCredited < (today - 3months) == false). If not older than 3mo, then return Active__c: true.
      if (x.LastCredited && new Date(x.LastCredited) >= new Date(new Date().setMonth(new Date().getMonth() - 3)))
        return 'Active';
      //e. if no LastCredited date, but occurrnece is defined...then active = true
      if (!x.EndDate && (x.Occurrence === 'Monthly' || x.Occurrence === 'Yearly')) return 'Active';
    }
  };

  const checkNpspActiveStatus = x => {
    // If csv.RecurringCancelDate not defined, then check csv.LastCredited as follows:
    if (!x.RecurringCancelDate) {
      // a. If csv.LastCredited not defined && csv.Occurrence also not defined OR None, then 'Lapsed'.
      // b. If csv.LastCredited not defined && csv.Occurrence = Monthly OR Yearly, then 'Lapsed'
      if (!x.LastCredited && !x.NextDate && (!x.Occurrence || x.Occurrence === 'None')) return undefined;

      // c. If csv.LastCredited is defined... check if date is older than 3 months from today (csv.LastCredited < (today - 3months) == true). If older, don't set Active__c: true.
      if (
        !x.NextDate &&
        x.LastCredited &&
        new Date(x.LastCredited) < new Date(new Date().setMonth(new Date().getMonth() - 3))
      )
        return undefined;
      // d. If csv.LastCredited is defined... check if date is NOT older than 3 months from today (csv.LastCredited < (today - 3months) == false). If not older than 3mo, then return Active__c: true.
      if (x.LastCredited && new Date(x.LastCredited) >= new Date(new Date().setMonth(new Date().getMonth() - 3)))
        return true;
      //e. if no LastCredited date, but occurrnece is defined...then active = true
      if (!x.EndDate && (x.Occurrence === 'Monthly' || x.Occurrence === 'Yearly')) return true;
    }
  };

  const baseMapping = x => {
    return {
      Committed_Giving_ID__c: `${x.PrimKey}${x.CardMasterID}`,
      Committed_Giving_Direct_Debit_ID__c: x.CardMasterID,
      'npe03__Contact__r.Committed_Giving_Id__c': x.PrimKey,
      npe03__Amount__c: x['Amount'],
      npsp__Status__c: checkNpspActiveInactiveStatus(x),
      Active__c: checkNpspActiveStatus(x),
      Closeout_Reason__c: x.RecurringCancelReason !== '' ? x.RecurringCancelReason : undefined,
      npe03__Installment_Period__c: x.Occurrence === 'None' || x.Occurrence === '' ? undefined : x.Occurrence,
      npe03__Date_Established__c:
        x.AddedDateTime && x.AddedDateTime !== '' ? formatDate(x.AddedDateTime) : x.AddedDateTime,
      npsp__StartDate__c: x.AddedDateTime && x.AddedDateTime !== '' ? increaseMonth(x.AddedDateTime) : x.AddedDateTime,
      npsp__EndDate__c: x.EndDate && x.EndDate !== '' ? formatDate(x.EndDate) : x.EndDate,
      npsp__PaymentMethod__c: 'Credit Card',
      Closeout_Date__c: x.RecurringCancelDate !== '' ? mapCancelDate(x.RecurringCancelDate) : x.RecurringCancelDate,
      npe03__Open_Ended_Status__c: 'Closed',
      of_Sisters_Requested__c:
        x['Amount'] == '22.00'
          ? 1
          : x['Amount'] % 264 === 0 || x.Occurrence === 'Yearly'
          ? Math.floor(Math.abs(x['Amount'] / 264))
          : x.Occurrence === 'Quarterly'
          ? Math.floor(Math.abs(x['Amount'] / 66))
          : x['Amount'] % 22 === 0 || x.Occurrence === 'Monthly'
          ? Math.floor(Math.abs(x['Amount'] / 22))
          : undefined,
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
        'npe03__Recurring_Donation_Campaign__r.Source_Code__c': 'UKWEBSP',
        'Sponsor__r.Committed_Giving_Id__c': x.PrimKey,
      },
    };
  });

  const multipleOf22IDs = multipleOf22.map(x => x.Name);

  const donations = state.data.json
    .filter(x => !multipleOf22IDs.includes(x.CardMasterID))
    .filter(x => x.Occurrence !== '' || x.Occurrence === 'None' && x.LastCredited==='')
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
            Number(selectAmount(x)) % 22 === 0 ? 'UKWEBSP' : 'UKWEBRG',
        },
      };
    });

  //combine all recurring donations into 1 array --> to later map to pledged Opps
  const sponsorshipsRaw = multipleOf22;
  const donationsRaw = state.data.json.filter(x => !multipleOf22IDs.includes(x.CardMasterID));
  const allDonations = sponsorshipsRaw.concat(donationsRaw);

  return { ...state, sponsorships, donations, allDonations, formatDate };
});

fn(state => {
  const { allDonations } = state;
  const formatDateYMD = inputDate => {
    // Split the input date string into date and time parts
    const datePart = inputDate.split(' ')[0];
    // Split the date part into day, month, and year
    const [day, month, year] = datePart.split('/');

    return year + '-' + month + '-' + day;
  };

  function addMonths(date, months) {
    const cleanDate = parseDate(date);
    const newDate = new Date(cleanDate);
    newDate.setMonth(cleanDate.getMonth() + months);
    return newDate;
  }

  function parseDate(dateString) {
    const [day, month, year] = dateString.split(/[/ :]/);
    const jsDate = new Date(`${year}-${month}-${day}`);
    return jsDate;
  }
  const mapPledged = (cardmasterid, cancelDate, paymentFrequency, lastClaimDate, nextDate) => {
    if (cancelDate && paymentFrequency === 'Monthly') {
      const newMonth = addMonths(lastClaimDate, 1).toISOString().split('T')[0];
      return `${cardmasterid}_${newMonth}_Pledged`;
    }

    //TODO: Confirm how to determine frequency if we only see None now
    if (cancelDate && paymentFrequency === 'None') {
      const newMonth = addMonths(lastClaimDate, 1).toISOString().split('T')[0];
      return `${cardmasterid}_${newMonth}_Pledged`;
    }

    if (cancelDate && paymentFrequency === 'Annually') {
      const newYear = addMonths(lastClaimDate, 12).toISOString().split('T')[0];
      return `${cardmasterid}_${newYear}_Pledged`;
    }

    if (cancelDate && paymentFrequency === 'SemiAnnually') {
      const newMonth = addMonths(lastClaimDate, 6).toISOString().split('T')[0];

      return `${cardmasterid}_${newMonth}_Pledged`;
    }

    if (cancelDate && paymentFrequency === 'Quarterly') {
      const newMonth = addMonths(lastClaimDate, 3).toISOString().split('T')[0];
      return `${cardmasterid}_${newMonth}_Pledged`;
    }

    if (cancelDate == '' && paymentFrequency === 'Monthly') {
      const newMonth = addMonths(lastClaimDate, 1).toISOString().split('T')[0];
      return `${cardmasterid}_${newMonth}_Pledged`;
    }

    if (cancelDate == '') {
      return `${cardmasterid}_${formatDateYMD(nextDate)}_Pledged`;
    }
  };

  function removeDuplicates(arr) {
    return [...new Set(arr)];
  }

  const cleanedDonations = removeDuplicates(allDonations).filter(x => x.Occurrence !== '' || 
  x.Occurrence === 'None' && x.LastCredited==='');
  //console.log('# pledged opportunities to schedule ::', allDonations.length);
  console.log('pledged opportunities to schedule ::', cleanedDonations);

  const selectGivingId = x => `${x.PrimKey}${x.CardMasterID}${formatDateYMD(x.NextDate)}`;

  const opportunities = cleanedDonations.filter(x => x.Occurrence !== '' || 
  x.Occurrence === 'None' && x.LastCredited==='').map(x => ({
    'npe03__Recurring_Donation__r.Committed_Giving_ID__c': `${x.PrimKey}${x.CardMasterID}`,
    CG_Pledged_Donation_ID__c: mapPledged(
      x.CardMasterID,
      x.RecurringCancelDate,
      x.Occurrence,
      x.LastCredited,
      x.NextDate
    ),
    Committed_Giving_ID__c: selectGivingId(x),
    StageName: x.RecurringCancelDate !== '' ? 'Closed Lost' : 'Pledged',
    CloseDate: x.RecurringCancelDate === '' ? formatDateYMD(x.NextDate) : formatDateYMD(x.RecurringCancelDate),
    Amount: x['Amount'],
    Name: x.CardMasterID,
    'npsp__Primary_Contact__r.Committed_Giving_ID__c': `${x.PrimKey}`,
  }));

  return { ...state, opportunities };
});

//Upserting recurring donations
bulk(
  'npe03__Recurring_Donation__c', // the sObject
  'upsert', //  the operation
  {
    extIdField: 'Committed_Giving_ID__c',
    failOnError: true,
    allowNoOp: true
  },
  state => {
    console.log('Bulk upserting donations.');
    return state.donations;
  }
);

bulk(
  'npe03__Recurring_Donation__c',
  'upsert',
  {
    extIdField: 'Committed_Giving_ID__c',
    failOnError: true,
    allowNoOp: true
  },
  state => {
    console.log('Bulk upserting Sponsorship.');
    return state.sponsorships;
  }
);

// Upserting opportunities
bulk(
  'Opportunity', // the sObject
  'upsert', // the operation
  {
    extIdField: 'CG_Pledged_Donation_ID__c',
    failOnError: false,
    allowNoOp: true
  },
  state => {
    console.log('Bulk upserting Pledged opps.');
    return state.opportunities;
  }
);

fn(state => {
  const errors = state.references.flat().filter(item => !item.success);
    
  const checkDupError = errors.filter(err =>
    err.errors[0].includes('DUPLICATE_VALUE:duplicate value found: Committed_Giving_ID__c')
  );

  if (errors.length > 0) {
    if (errors.length === checkDupError.length) {
      console.log('Ingoring DUPLICATE_VALUE:duplicate value found');
    } else {
      throw new Error('Errors detected, scroll up to see the resutls')
    }
  }

  // lighten state
  return { ...state, donations: [], opportunities: [] };
});
