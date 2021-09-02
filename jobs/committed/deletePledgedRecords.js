query(
  `SELECT Id, Committed_Giving_ID__c, CloseDate from Opportunity WHERE Committed_Giving_ID__c != null AND StageName = 'Pledged'`
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
  const chunkToDelete = chunk(IDtoDeletes, 200);

  state.chunkToDelete = chunkToDelete;
  return state;
});

each('chunkToDelete[*]', state => {
  console.log('Opps to delete', state.data); 
  return destroy('Opportunity', state => state.data)(state);
});

fn(state => ({
  ...state,
  references: [],
}));