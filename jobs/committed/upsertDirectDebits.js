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
    if (item['Current amount']) {
      return isNaN(item['Current amount'])
        ? item['Current amount'].replace(/[^-.0-9]/g, '')
        : parseInt(item['Current amount']);
    }
    return undefined;
  };
  // Use for TransType re-processing if CG provides the incorrect value
  // const selectAmount = item => {
  //   if (item['FirstAmount']) { //CHANGED FROM: 'Current amount'
  //     return isNaN(item['FirstAmount']) ? item['FirstAmount'].replace(/[^-.0-9]/g, '') : parseInt(item['FirstAmount']);
  //   }
  //   return undefined;
  // };

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

      case 'SemiAnnually':
        const add181Days = addDaysToDate(parseCustomDate(lastClaimDate), 181);
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
        Type__c: x.TransType === 'Sponsorship' ? 'Sponsorship' : 'Recurring Donation',
        'npe03__Recurring_Donation_Campaign__r.Source_Code__c': x.TransType === 'Sponsorship' ? 'UKSPCC' : 'UKRG',
        npe03__Amount__c: x['Current amount'],
        npsp__Status__c: x.Status === 'Live' ? 'Active' : undefined,
        Active__c: x.Status === 'Live' ? true : undefined, //Nov 2022 Request: To not uncheck Active, only add Closeout Date
        Closeout_Reason__c: x.CancelReason,
        npe03__Installment_Period__c: x.PaymentFrequency === 'Annually' ? 'Yearly' : x.PaymentFrequency,
        npe03__Date_Established__c: x.AddedDateTime ? formatDate(x.AddedDateTime) : x.AddedDateTime,
        npe03__Next_Payment_Date__c: !x.CancelDate ? formatDate(x.NextDate) : undefined,
        npsp__EndDate__c: x.EndDate ? formatDate(x.EndDate) : x.EndDate,
        Committed_Giving_Direct_Debit_Reference__c: x.DDRefforBank,
        npsp__PaymentMethod__c: 'Direct Debit',
        Closeout_Date__c: x.CancelDate
          ? mapCancelDate(x.CancelDate, x.PaymentFrequency, x.LastClaimDate)
          : formatEmpty(x.CancelDate),
        npe03__Open_Ended_Status__c: 'Closed',
        of_Sisters_Requested__c:
          x['Current amount'] == '22.00'
            ? 1
            : x['Current amount'] % 264 === 0 || (x.PaymentFrequency === 'Annually' && x.TransType === 'Sponsorship')
            ? Math.floor(Math.abs(x['Current amount'] / 264))
            : x.PaymentFrequency === 'Quarterly' && x.TransType === 'Sponsorship'
            ? Math.floor(Math.abs(x['Current amount'] / 66))
            : x['Current amount'] % 22 === 0 || (x.PaymentFrequency === 'Monthly' && x.TransType === 'Sponsorship')
            ? Math.floor(Math.abs(x['Current amount'] / 22))
            : undefined,
        // Use for TransType re-processing if CG provides the incorrect value
        // of_Sisters_Requested__c: (x['FirstAmount'] == '22' ? 1 :
        // x['FirstAmount'] % 264 === 0 || (x.PaymentFrequency === 'Annually' && x.TransType === 'Sponsorship') ? Math.floor(Math.abs(x['FirstAmount'] / 264)) :
        //     (x.PaymentFrequency === 'Quarterly' && x.TransType === 'Sponsorship') ? Math.floor(Math.abs(x['FirstAmount'] / 66)) :
        //       x['FirstAmount'] % 22 === 0 || (x.PaymentFrequency === 'Monthly' && x.TransType === 'Sponsorship') ? Math.floor(Math.abs(x['FirstAmount'] / 22)) :
        //       undefined),
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

  const mapPledged = (ddid, status, paymentFrequency, lastClaimDate, nextDate) => {
    if (status === 'Cancelled' && paymentFrequency === 'Monthly') {
      let addMonth = new Date(lastClaimDate);
      addMonth = addMonth.setMonth(addMonth.getMonth() + 1);
      const newMonth = new Date(addMonth).toISOString().split('T')[0];
      return `${ddid}_${newMonth}_Pledged`;
    }
    if (status === 'Cancelled' && paymentFrequency === 'Annually') {
      let addYear = new Date(formatDateYMD(lastClaimDate));
      addYear = addYear.setFullYear(addYear.getFullYear() + 1);
      const newYear = new Date(addYear).toISOString().split('T')[0];
      return `${ddid}_${newYear}_Pledged`;
    }

    if (status !== 'Cancelled') {
      return `${ddid}_${formatDateYMD(nextDate)}_Pledged`;
    }
  };

  const opportunities = state.data.json
    .filter(x => x.PrimKey)
    .map(x => ({
      'npe03__Recurring_Donation__r.Committed_Giving_ID__c': `${x.PrimKey}${x.DDId}`,
      CG_Pledged_Donation_ID__c: mapPledged(x.DDId, x.Status, x.PaymentFrequency, x.LastClaimDate, x.NextDate),
      StageName: x.CancelDate !== '' ? 'Pledged' : 'Closed Lost',
      CloseDate: x.CancelDate == '' ? formatDateYMD(x.NextDate) : formatDateYMD(x.CancelDate),
      Amount: x['Current amount'],
      Name: x.DDRefforBank,
    }));

  return { ...state, opportunities };
});

// Upserting donation
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
    failOnError: true,
    allowNoOp: true,
  },
  state => state.opportunities
);

fn(state => {
  // lighten state
  return { ...state, donations: [], opportunities: [] };
});
