query(`SELECT Id, CG_Credit_Card_Master_ID__c from Opportunity WHERE CG_Credit_Card_Master_ID__c != null and npe03__Recurring_Donation__c = null
`);

fn(state => {
  const { records } = state.references[0];

  const cardMasterIds = records.map(record => record.CG_Credit_Card_Master_ID__c);
  const Ids = records.map(record => {
    return { Id: record.Id, CG_Credit_Card_Master_ID__c: record.CG_Credit_Card_Master_ID__c };
  });

  return { ...state, cardMasterIds, Ids };
});

query(
  state => `SELECT Id, CG_Credit_Card_ID__c  from npe03__Recurring_Donation__c WHERE CG_Credit_Card_ID__c in 
('${state.cardMasterIds.join("','")}')
`
);

fn(state => {
  const { records } = state.references[0];
  const { cardMasterIds, Ids } = state;

  const matchingRDs = records.map(record => record.CG_Credit_Card_ID__c);

  const toUpdate = [];
  for (let rdId of matchingRDs) {
    if (cardMasterIds.includes(rdId)) {
      const id = Ids.find(id => id.CG_Credit_Card_ID__c === rdId).Id;
      toUpdate.push({
        Id: id,
        'Opportunity.npe03__Recurring_Donation__c': rdId,
      });
    }
  }

  return { ...state, toUpdate };
});

bulk(
  'Opportunities',
  'update',
  {
    failOnError: true,
    allowNoOp: true,
  },
  state => {
    console.log('Bulk upserting Opportunities.');
    return state.toUpdate;
  }
);
