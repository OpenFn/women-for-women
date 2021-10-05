query(
  `SELECT Id, npe03__Recurring_Donation__r.Committed_Giving_ID__c, npe03__Recurring_Donation__r.Active__c, closeDate from Opportunity WHERE npe03__Recurring_Donation__r.Committed_Giving_ID__c != NULL AND StageName = 'Pledged' `
);
fn(state => {
  const { records } = state.references[0];
  const chunk = (arr, chunkSize) => {
    var R = [];
    for (let i = 0, len = arr.length; i < len; i += chunkSize) R.push(arr.slice(i, i + chunkSize));
    return R;
  };

  const toDeletes = records.filter(rec => new Date(rec.CloseDate) < new Date());
  const IDtoDeletes = toDeletes.map(rec => rec.Id);
  const chunkToDelete = chunk(IDtoDeletes, 100);
  
  const inactiveOpps = records.filter(rec => rec['npe03__Recurring_Donation__r.Active__c'] === false);
  const OppsToDel = inactiveOpps.map(rec => rec.Id);
  const otherChunkToDel = chunk(OppsToDel, 100);

  state.chunkToDelete = chunkToDelete;
  state.chunkToDelete2 = otherChunkToDel;
  
  return state;
});

each('chunkToDelete[*]', state => {
  //console.log('Opps to delete', state.data);
  return destroy('Opportunity', state => state.data, { failOnError: false })(state);
});
each('chunkToDelete2[*]', state => {
  //console.log('Opps to delete', state.data);
  return destroy('Opportunity', state => state.data, { failOnError: false })(state);
});

fn(state => ({
  ...state,
  references: [],
}));
