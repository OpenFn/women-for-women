query(`SELECT Id, CG_Credit_Card_Master_ID__c from Opportunity WHERE CG_Credit_Card_Master_ID__c != null and npe03__Recurring_Donation__c = null
`);

fn(state => {
  const { records } = state.references[0];

  const chunk = (arr, chunkSize) => {
    var R = [];
    for (var i = 0, len = arr.length; i < len; i += chunkSize) R.push(arr.slice(i, i + chunkSize));
    return R;
  };

  const cardMasterIds = records.map(record => record.CG_Credit_Card_Master_ID__c);
  const Ids = records.map(record => {
    return { Id: record.Id, CG_Credit_Card_Master_ID__c: record.CG_Credit_Card_Master_ID__c };
  });

  const setsCardMaster = chunk(cardMasterIds, 500);
  const setsIds = chunk(Ids, 500);

  return { ...state, setsCardMaster, setsIds, toUpdate: [] };
});

each('$.setsCardMaster[*]', state => {
  return query(
    state => `SELECT Id, CG_Credit_Card_ID__c  from npe03__Recurring_Donation__c WHERE CG_Credit_Card_ID__c in 
    ('${state.data.join("','")}')
    `
  )(state).then(state => {
    const { records } = state.references[0];

    const Ids = state.setsIds[state.index];

    // Check matching recurring donations CGIDs
    const matchingRDs = records.map(record => record.CG_Credit_Card_ID__c);

    for (let rdId of matchingRDs) {
      if (state.data.includes(rdId)) {
        const id = Ids.find(id => id.CG_Credit_Card_Master_ID__c === rdId).Id;
        state.toUpdate.push({
          //Id: id,
          CG_Credit_Card_ID__c: id, 
          npe03__Recurring_Donation__c: rdId,
        });
      }
    }
    return state;
  });
});

bulk(
  'Opportunity',
  'upsert',
  {
    extIdField: 'CG_Credit_Card_ID__c',
    failOnError: true,
    allowNoOp: true,
  },
  state => {
    console.log('Bulk upserting Opportunities.');
    return state.toUpdate;
  }
);
