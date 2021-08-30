query(`SELECT Id FROM Opportunity`);

fn(state => {
  const { records } = state.references[0];

  const IDOpportunities = records.map(rec => rec.Id);

  const chunk = (arr, chunkSize) => {
    var R = [];
    for (let i = 0, len = arr.length; i < len; i += chunkSize) R.push(arr.slice(i, i + chunkSize));
    return R;
  };

  const chunks = chunk(IDOpportunities, 200);

  return { ...state, chunks, chunk };
});

each('chunks[*]', state => {
  return destroy('Opportunity', state => state.data)(state);
});

query(`SELECT Id FROM npe03__Recurring_Donation__c`);

fn(state => {
  const { records } = state.references[0];

  const IDDonations = records.map(rec => rec.Id);

  const chunks = state.chunk(IDDonations, 200);

  return { ...state, chunks };
});

each('chunks[*]', state => {
  return destroy('npe03__Recurring_Donation__c', state => state.data)(state);
});
