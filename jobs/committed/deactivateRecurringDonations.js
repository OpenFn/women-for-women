fn(state => {
  const json = state.data.json.filter(x => x.RecurringCancelDate && x.PrimKey);
  return { ...state, data: { ...state.data, json } };
});

each('$.data.json[*]', state => {
  const { PrimKey, RecurringCancelDate, RecurringCancelReason } = state.data;
  const formatDate = date => {
    if (!date) return null;
    date = date.split(' ')[0];
    const parts = date.match(/(\d+)/g);
    const year = String(parts[2]).length > 2 ? parts[2] : `20${parts[2]}`;
    const month = String(parts[1]).length === 2 ? parts[1] : `0${parts[1]}`;
    const day = String(parts[0]).length === 2 ? parts[0] : `0${parts[0]}`;
    return parts ? `${year}-${month}-${day}` : null;
  };

  return query(
    `SELECT Id, npe03__Date_Established__c  FROM npe03__Recurring_Donation__c WHERE Active__c = TRUE AND npe03__Contact__r.Committed_Giving_Id__c = '${PrimKey}' AND npe03__Date_Established__c < ${formatDate(
      RecurringCancelDate
    )}`
  )(state).then(state => {
    const { records } = state.references[0];
    const toUpdates = [];
    if (records.length > 0) {
      records.forEach(rec => {
        toUpdates.push({
          Id: rec.Id,
          Active__c: false,
          Closeout_Date__c: RecurringCancelDate,
          Closeout_Reason__c: RecurringCancelReason,
          npe03__Next_Payment_Date__c: null,
        });
      });
    } else {
      console.log(
        `No earlier Recurring Donations found to deactivate for ${PrimKey}. Skipping cancellation/closeout step.`
      );
    }
    return { ...state, toUpdates };
  });
});

bulk(
  'npe03__Recurring_Donation__c',
  'update',
  {
    failOnError: true,
    allowNoOp: true,
  },
  state => {
    console.log('Bulk updating npe03__Recurring_Donation__c.');
    return state.toUpdates;
  }
);
