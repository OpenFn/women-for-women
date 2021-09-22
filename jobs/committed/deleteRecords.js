query(`SELECT Id FROM Opportunity WHERE CreatedById = '0053i000002POGWAA4'`);

fn(state => {
  const { records } = state.references[0];

  const IDOpportunities = records.map(rec => rec.Id);

  const chunk = (arr, chunkSize) => {
    var R = [];
    for (let i = 0, len = arr.length; i < len; i += chunkSize) R.push(arr.slice(i, i + chunkSize));
    return R;
  };

  const chunkOpportunities = chunk(IDOpportunities, 200);

  return { ...state, chunkOpportunities, chunk };
});

query(`SELECT Id FROM npe03__Recurring_Donation__c WHERE CreatedById = '0053i000002POGWAA4'`);

fn(state => {
  const { records } = state.references[0];

  const IDDonations = records.map(rec => rec.Id);

  const chunkDonations = state.chunk(IDDonations, 200);

  return { ...state, chunkDonations };
});

each('chunkOpportunities[*]', state => {
  return destroy('Opportunity', state => state.data, { failOnError: true })(state);
});

each('chunkDonations[*]', state => {
  return destroy('npe03__Recurring_Donation__c', state => state.data, { failOnError: true })(state);
});

fn(state => ({
  ...state,
  references: [],
}));
