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

  return query(`SELECT Id, name from CONTACT`)(state).then(state => {
    const { records } = state.references[0];
    const names = records.filter(rec => rec.Id);
    return { ...state, names };
  });
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
      const name = x['Notify Name'];
      const contact = state.names.find(rec => rec.Name === name);
      return {
        CG_Credit_Card_ID__c: x.DDID,
        npsp__Tribute_Type__c: x.FormName,
        npsp__Honoree_Name__c: x['Honouree / Tributee Name'],
        wfw_Honoree_City__c: x['Notify Town'],
        wfw_Honoree_Zip__c: x['Notify Postcode'],
        wfw_Honoree_State__c: x['Notify County'],
        wfw_Honoree_Country__c: x['Notify Country'],
        npsp__Honoree_Contact__c: contact ? contact.id : null,
        Tribute_Occasion_Text__c: x.Occasion,
        wfw_Honoree_Address_1__c: x['Notify Add1'],
        Honoree_Address_2__c: x['Notify Add2'],
      };
    });
  }
);
