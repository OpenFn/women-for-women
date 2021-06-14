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

bulk(
  'Opportunity', // the sObject
  'upsert', //  the operation
  {
    extIdField: 'CG_Credit_Card_ID__c', // the field to match on
    failOnError: true, // throw error if just ONE record fails
    allowNoOp: true, // what is this?
  },
  state => {
    return state.newJson.map(x => {
      return {
        CG_Credit_Card_ID__c: x.CCID,
        npsp__Tribute_Type__c: x.FormName,
        Tribute_Occasion_Text__c: x.Occasion,
        npsp__Honoree_Name__c: x['Honouree / Tributee Name'],
        Paper_Card_Shipping_City__c: x['Notify Town'],
        Paper_Card_Shipping_Zip_Postal__c: x['Notify Postcode'],
        Paper_Card_Shipping_State_Province__c: x['Notify County'],
        Paper_Card_Shipping_Country__c: x['Notify Country'],
        Paper_Card_Shipping_Name__c: x['Notify Name'],
        Paper_Card_Shipping_Address__c: x['Notify Add1'],
        Paper_Card_Shipping_Address_Line_2__c: x['Notify Add2'],
        eCard_Recipient_Email__c: x['Notify Email Address'],
      };
    });
  }
);
