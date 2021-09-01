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

  const group = reduceArray(json, 'CCID');

  for (let obj in group) {
    const newObj = {};
    group[obj].forEach(ob => {
      if (ob.FieldName) newObj[ob.FieldName] = ob.Value;
    });
    newObj['CCID'] = obj;
    newJson.push(newObj);
  }

  const CCIDs = newJson.map(x => x.CCID);

  return { ...state, data: { ...state.data, json: newJson }, CCIDs };
});

each(
  '$.data.json[*]',
  fn(state => {
    const { CCID } = state.data;
    return query(
      `Select Id, CloseDate FROM Opportunity 
      WHERE CG_Credit_Card_Master_ID__c = '${CCID}'
      ORDER BY CloseDate ASC LIMIT 1`
    )(state).then(state => {
      const { records } = state.references[0];
      if (records.length === 0) {
        throw new Error(
          'Matching Opportunity not found for this transaction. Please confirm that related Transaction data has been synced to Salesforce before re-running'
        );
      } else {
        return update(
          'Opportunity',
          fields(
            field(npsp__Tribute_Type__c, dataValue('FormName')(state)),
            field(Tribute_Occasion_Text__c, dataValue('Occasion')),
            field(npsp__Honoree_Name__c, dataValue('Honouree / Tributee Name')),
            field(Paper_Card_Shipping_City__c, dataValue('Notify Town')),
            field(Paper_Card_Shipping_Zip_Postal__c, dataValue('Notify Postcode')),
            field(Paper_Card_Shipping_State_Province__c, dataValue('Notify County')),
            field(Paper_Card_Shipping_Country__c, dataValue('Notify Country')),
            field(Paper_Card_Shipping_Name__c, dataValue('Notify Name')),
            field(Paper_Card_Shipping_Address__c, dataValue('Notify Add1')),
            field(Paper_Card_Shipping_Address_Line_2__c, dataValue('Notify Add2')),
            field(eCard_Recipient_Email__c, dataValue('Notify Email Address'))
          )
        )(state);
      }
    });
  })
);
