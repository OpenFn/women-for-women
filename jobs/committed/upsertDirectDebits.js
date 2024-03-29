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
    if (item['CurrentAmount']) {
      return isNaN(item['CurrentAmount'])
        ? item['CurrentAmount'].replace(/[^-.0-9]/g, '')
        : parseInt(item['CurrentAmount']);
    }
    return undefined;
  };

  const formatEmpty = item => (item === '' ? undefined : item);

  const addDaysToDate = (inputDate, daysToAdd) => {
    const startDate = new Date(inputDate);

    const endDate = startDate.setDate(startDate.getDate() + daysToAdd);

    return new Date(endDate);
  };

  const mapCancelDate = (cancelDate, paymentFrequency, lastClaimDate) => {
    switch (paymentFrequency) {
      case 'Monthly':
        return formatDate(cancelDate);

      case 'Annually':
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

  const donations = state.data.json
    .filter(x => x.PrimKey)
    .map(x => {
      return {
        Committed_Giving_ID__c: `${x.PrimKey}${x.DDId}`,
        Committed_Giving_Direct_Debit_ID__c: x.DDId,
        'npe03__Contact__r.Committed_Giving_Id__c': x.PrimKey,
        'Sponsor__r.Committed_Giving_Id__c': x.PrimKey,
        Type__c: x.CampaignCode === 'Sponsorship' ? 'Sponsorship' : 'Recurring Donation',
        Stand_With_Her_Subtype__c:
          x.CampaignCode === 'Sponsorship' ? 'Sister Tier' : x.CampaignCode === 'Classroom' ? 'Classroom Tier' : 'None',
        'npe03__Recurring_Donation_Campaign__r.Source_Code__c':
          x.PromoCode || (x.CampaignCode === 'Sponsorship' ? 'UKWEBSP' : 'UKWEBRG'),
        //'npe03__Recurring_Donation_Campaign__r.Source_Code__c': x.TransType === 'Sponsorship' ? 'UKWEBSP' : 'UKWEBRG',
        npe03__Amount__c: x['CurrentAmount'],
        npsp__Status__c: x.Status === 'Live' ? 'Active' : 'Closed',
        Active__c: x.Status === 'Live' ? true : undefined, //Nov 2022 Request: To not uncheck Active, only add Closeout Date
        Closeout_Reason__c: x.CancelReason,
        npe03__Installment_Period__c: x.PaymentFrequency === 'Annually' ? 'Yearly' : x.PaymentFrequency,
        npe03__Date_Established__c: x.AddedDateTime ? formatDate(x.AddedDateTime) : x.AddedDateTime,
        npsp__EndDate__c: x.EndDate ? formatDate(x.EndDate) : x.EndDate,
        Committed_Giving_Direct_Debit_Reference__c: x.DDRefforBank,
        npsp__PaymentMethod__c: 'Direct Debit',
        Closeout_Date__c: x.CancelDate
          ? mapCancelDate(x.CancelDate, x.PaymentFrequency, x.LastClaimDate)
          : formatEmpty(x.CancelDate),
        npe03__Open_Ended_Status__c: 'Closed',
        of_Sisters_Requested__c: x['No of Sisters'] ? x['No of Sisters'] : undefined,
      };
    });

  return { ...state, donations, formatDate };
});

fn(state => {
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
  const mapPledged = (ddid, cancelDate, paymentFrequency, lastClaimDate, nextDate, startDate) => {
    if (cancelDate && paymentFrequency === 'Monthly' && lastClaimDate !== startDate) {
      const newMonth = addMonths(lastClaimDate, 1).toISOString().split('T')[0];
      return `${ddid}_${newMonth}_Pledged`;
    }

    if (cancelDate && paymentFrequency === 'Annually') {
      const newYear = addMonths(lastClaimDate, 12).toISOString().split('T')[0];
      return `${ddid}_${newYear}_Pledged`;
    }

    if (cancelDate && paymentFrequency === 'Semi Annually') {
      const newMonth = addMonths(lastClaimDate, 6).toISOString().split('T')[0];

      return `${ddid}_${newMonth}_Pledged`;
    }

    if (cancelDate && paymentFrequency === 'Quarterly') {
      const newMonth = addMonths(lastClaimDate, 3).toISOString().split('T')[0];
      return `${ddid}_${newMonth}_Pledged`;
    }

    if (cancelDate == '') {
      return `${ddid}_${formatDateYMD(nextDate)}_Pledged`;
    }
  };

  const setCloseDate = (cancelDate, paymentFrequency, lastClaimDate, nextDate) => {
    if (cancelDate && paymentFrequency === 'Monthly') {
      return addMonths(lastClaimDate, 1).toISOString().split('T')[0];
    }

    if (cancelDate && paymentFrequency === 'Annually') {
      return addMonths(lastClaimDate, 12).toISOString().split('T')[0];
    }

    if (cancelDate && paymentFrequency === 'Semi Annually') {
      return addMonths(lastClaimDate, 6).toISOString().split('T')[0];
    }

    if (cancelDate && paymentFrequency === 'Quarterly') {
      return addMonths(lastClaimDate, 3).toISOString().split('T')[0];
    }

    if (cancelDate == '') {
      return formatDateYMD(nextDate);
    }
  };

  const cleanDate = date => {
    if (!date) return undefined;
    date = date.replace(/[:\/]/g, '');
    return date.replace(/\s+/g, '');
  };

  const selectGivingId = x => `${x.PrimKey}${x.DDId || x.DDid}${x.DDRefforBank}${cleanDate(x.NextDate)}`;

  const opportunities = state.data.json
    .filter(x => x.PrimKey)
    //NOTE: Added logic below to filter out donations canceled the same month
    // We don't need to schedule the next pledged opp, if it was closed the same month the donation started
    .filter(x => !(x.CancelDate !== '' && x.LastClaimDate === x.StartDate))
    //=================================================================//
    .map(x => ({
      Committed_Giving_ID__c: selectGivingId(x),
      'npe03__Recurring_Donation__r.Committed_Giving_ID__c': `${x.PrimKey}${x.DDId}`,
      CG_Pledged_Donation_ID__c: mapPledged(x.DDId, x.CancelDate, x.PaymentFrequency, x.LastClaimDate, x.NextDate),
      StageName: x.CancelDate !== '' ? 'Closed Lost' : 'Pledged',
      CloseDate: setCloseDate(x.CancelDate, x.PaymentFrequency, x.LastClaimDate, x.NextDate),
      Amount: x['CurrentAmount'],
      Name: x.DDRefforBank,
      'npsp__Primary_Contact__r.Committed_Giving_ID__c': `${x.PrimKey}`,
      E_mail_Mailing_ID__c: x.EmailMailingID,
      Campaign_name__c: x.Campaign,
      Campaign_Source__c: x.CampaignSource,
      Campaign_Content__c: x.CampaignContent,
      Campaign_Medium__c: x.CampaignMedium,
    }));

  return { ...state, opportunities };
});

//Upserting donation
bulk(
  'npe03__Recurring_Donation__c', // the sObject
  'upsert', //  the operation
  {
    extIdField: 'Committed_Giving_ID__c',
    failOnError: true,
    allowNoOp: true,
  },
  state => state.donations
);

// Upserting opportunities
bulk(
  'Opportunity', // the sObject
  'upsert', // the operation
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
  return { ...state, donations: [], opportunities: [] };
});
