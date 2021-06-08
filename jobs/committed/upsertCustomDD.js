alterState(state => {
  const { json } = state.data;
  const newJson = [];

  function reduceArray(array) {
    const arr = array.reduce((r, a) => {
      r[a.DDID] = r[a.DDID] || [];
      r[a.DDID].push(a);

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
    newObj['DDID'] = obj;
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
      field('CG_Credit_Card_ID__c', dataValue('DDID')),
      field('npsp__Tribute_Type__c', dataValue('FormName')),
      field('npsp__Honoree_Name__c', dataValue('Honouree / Tributee Name')),
      field('wfw_Honoree_City__c', dataValue('Notify Town')),
      field('wfw_Honoree_Zip__c', dataValue('Notify Postcode')),

      field('wfw_Honoree_State__c', dataValue('Notify County')),
      field('wfw_Honoree_Country__c', dataValue('Notify Country')),
     // field('npsp__Honoree_Contact__c', dataValue('Notify Name')),
      field('Tribute_Occasion_Text__c', dataValue('Occasion')),
      field('wfw_Honoree_Address_1__c', dataValue('Notify Add1')),
      field('Honoree_Address_2__c', dataValue('Notify Add2'))
    )
  )
);
