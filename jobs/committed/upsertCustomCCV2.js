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
  const queryAndUpdate = (CCID, contactId, state) => {
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
            field('Id', records[0].Id),
            field('npsp__Tribute_Type__c', state => {
              var tribute = state.data['FormName'];
              return tribute ? tribute : 'Honor';
            }),
            field('Tribute_Occasion_Text__c', state.data['Occasion']),
            field('npsp__Honoree_Name__c', state.data['Honouree / Tributee Name']),
            field('Paper_Card_Shipping_Name__c', state.data['Notify Name']),
            field('Paper_Card_Shipping_Address__c', state.data['Notify Add1']),
            field('Paper_Card_Shipping_Address_Line_2__c', state.data['Notify Add2']),
            field('Paper_Card_Shipping_City__c', state.data['Notify Town']),
            field('Paper_Card_Shipping_Zip_Postal__c', state.data['Notify Postcode']),
            field('Paper_Card_Shipping_State_Province__c', state.data['Notify County']),
            field('Paper_Card_Shipping_Country__c', state.data['Notify Country']),
            field('eCard_Recipient_Email__c', state.data['Notify Email Address']),
            field('npsp__Honoree_Contact__c', contactId)
          )
        )(state);
      }
    });
  })
);
