fn(state => {
  const formatDate = date => {
    console.log(date);
    if (!date || date === 'NULL') return null;
    date = date.split(' ')[0];
    const parts = date.match(/(\d+)/g);
    const year = String(parts[2]).length > 2 ? parts[2] : `20${parts[2]}`;
    return parts ? new Date(Number(year), parts[1] - 1, parts[0]).toISOString() : parts;
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
    const date = new Date(inputDate);
    date.setDate(date.getDate() + daysToAdd);
    return date;
  };
  const mapCancelDate = (cancelDate, paymentFrequency, lastClaimDate) => {
    switch (paymentFrequency) {
      case 'Monthly':
        return formatDate(cancelDate);

      case 'Annually':
        const resultDate = addDaysToDate(lastClaimDate.split(' ')[0], 364);
        console.log(resultDate, 'result Date');
        return resultDate.toISOString().slice(0, 10);
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
  const { formatDate } = state;
  const mapPledged = (ddid, status, paymentFrequency, lastClaimDate, nextDate) => {
    if (status === 'Cancelled' && paymentFrequency === 'Monthly') {
      let addMonth = new Date(lastClaimDate);
      addMonth = addMonth.setDate(addMonth.getMonth() + 1);
      return `${ddid}_${formatDate(addMonth)}_Pledged`;
    }
    if (status === 'Cancelled' && paymentFrequency === 'Annually') {
      let addYear = new Date(lastClaimDate);
      addYear = addYear.setDate(addYear.getYear() + 1);
      return `${ddid}_${formatDate(addYear)}_Pledged`;
    }

    if (status !== 'Cancelled') {
      return `${ddid}_${formatDate(nextDate)}_Pledged`;
    }
  };

  const opportunity = state.data.json
    .filter(x => x.PrimKey)
    .map(x => ({
      'npe03__Recurring_Donation__r.Committed_Giving_ID__c': `${x.PrimKey}${x.DDId}`,
      CG_Pledged_Donation_ID__c: mapPledged(x.DDid, x.Status, x.PaymentFrequency, x.LastClaimDate, x.NextDate),
      StageName: x.CancelDate !== '' ? 'Pledged' : 'Closed Lost',
      CloseDate: x.NextDate !== '' ? formatDate(x.NextDate) : 'undefined',
      Amount: x.Amount,
    }));

  return { ...state, opportunity };
});

// bulk(
//   'npe03__Recurring_Donation__c', // the sObject
//   'upsert', //  the operation
//   {
//     extIdField: 'Committed_Giving_ID__c',
//     failOnError: true,
//     allowNoOp: true,
//   },
//   state => state.donations
// );

// fn(state => {
//   // lighten state
//   return { ...state, donations: [] };
// });
