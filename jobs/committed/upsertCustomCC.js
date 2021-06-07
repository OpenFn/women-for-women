alterState(state => {
  const { json } = state.data;
  const newJson = [];

  function reduceArray(array) {
    const arr = array.reduce((r, a) => {
      r[a.CCID] = r[a.CCID] || [];
      r[a.CCID].push(a);

      return r;
    }, Object.create(null));
    return arr;
  }

  const group = reduceArray(json);
  for (let obj in group) {
    const newObj = {};
    group[obj].forEach(ob => {
      if (ob.FieldName) newObj[ob.FieldName] = ob.Value;
    });
    newObj['CCID'] = obj;
    newJson.push(newObj);
  }

  // state.group = group;
  state.newJson = newJson;
  return state;
});

beta.each(
  'newJson[*]',
  upsert(
    'Opportunity',
    'CG_Credit_Card_ID__c', //CHANGE TO CG_Credit_Card_ID__c ?
    fields(
      field('CG_Credit_Card_ID__c', dataValue('CCID')),
      field('npsp__Tribute_Type__c', dataValue('FormName')),
      field('Tribute_Occasion_Text__c', dataValue('Occasion')),
      field('npsp__Honoree_Name__c', dataValue('Honouree / Tributee Name')),
      field('Paper_Card_Shipping_City__c', dataValue('Notify Town')),
      field('Paper_Card_Shipping_Zip_Postal__c', dataValue('Notify Postcode')),
      field('Paper_Card_Shipping_State_Province__c', dataValue('Notify County')),
      field('Paper_Card_Shipping_Country__c', dataValue('Notify Country')),
      field('Paper_Card_Shipping_Name__c', dataValue('Notify Name')),
      field('Paper_Card_Shipping_Address__c', dataValue('Notify Add1')),
      field('Paper_Card_Shipping_Address_Line_2__c', dataValue('Notify Add2')),
      field('eCard_Recipient_Email__c', dataValue('Notify Email Address'))
    )
  )
);
