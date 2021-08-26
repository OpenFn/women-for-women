fn(state => {
  const { json } = state.data;
  const newJson = [];

  function reduceArray(array, groupBy) {
    return array.reduce((r, a) => {
      r[a[groupBy]] = r[a[groupBy]] || [];
      r[a[groupBy]].push(a);

      return r;
    }, Object.create(null));
  }

  const group = reduceArray(json, 'DDID');
  for (let obj in group) {
    const newObj = {};
    group[obj].forEach(ob => {
      if (ob.FieldName) newObj[ob.FieldName] = ob.Value;
    });
    newObj['DDID'] = obj;
    newJson.push(newObj);
  }

  const DDIDs = newJson.map(x => x.DDIS);

  return { ...state, data: { ...state.data, json: newJson }, DDIDs };
});

each(
  '$.data.json[*]',
  fn(state => {
    const { DDID } = state.data;
    return query(
      `Select Id, CloseDate FROM Opportunity 
      WHERE npe03__Recurring_Donation__r.Committed_Giving_Direct_Debit_ID__c = '${DDID}'
      ORDER BY CloseDate ASC LIMIT 1`
    )(state).then(state => {
      const { records } = state.references[0];
      if (records.length === 0) {
        throw new Error(
          'Matching Opportunity not found for this transaction. Please confirm that related Transaction data has been synced to Salesforce before re-running.'
        );
      } else {
        return update(
          'Opportunity',
          fields(
            field(CG_Credit_Card_ID__c, DDID),
            field(npsp__Tribute_Type__c, dataValue('FormName')),
            field(npsp__Honoree_Name__c, dataValue('Honouree / Tributee Name')),
            field(wfw_Honoree_City__c, dataValue('Notify Town')),
            field(wfw_Honoree_Zip__c, dataValue('Notify Postcode')),
            field(wfw_Honoree_State__c, dataValue('Notify County')),
            field(wfw_Honoree_Country__c, dataValue('Notify Country')),
            field(npsp__Honoree_Contact__c, dataValue('Notify Name')),
            field(Tribute_Occasion_Text__c, dataValue('Occasion')),
            field(wfw_Honoree_Address_1__c, dataValue('Notify Add1')),
            field(Honoree_Address_2__c, dataValue('Notify Add2'))
          )
        )(state);
      }
    });
  })
);