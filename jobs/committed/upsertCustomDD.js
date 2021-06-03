upsert(
  'Opportunity',
  'Direct_Debit_ID__c', //Change to CG_Direct_Debit_ID__c ?
  fields(
    field('CG_Credit_Card_ID__c', dataValue('DDID')), //SHould this be CG_Direct_Debit_ID__c ?
    field('npsp__Tribute_Type__c', state => {
      const obj = state.data.json.find(js => js.FieldName === 'FormName');
      return obj ? obj['Value'] : '';
    }),
    field('npsp__Honoree_Name__c', state => {
      const obj = state.data.json.find(js => js.FieldName === 'Honouree / Tributee Name');
      return obj ? obj['Value'] : '';
    }),
    field('wfw_Honoree_City__c', state => {
      const obj = state.data.json.find(js => js.FieldName === 'Notify Town');
      return obj ? obj['Value'] : '';
    }),
    field('wfw_Honoree_Zip__c', state => {
      const obj = state.data.json.find(js => js.FieldName === 'Notify Postcode');
      return obj ? obj['Value'] : '';
    }),
    field('wfw_Honoree_State__c', state => {
      const obj = state.data.json.find(js => js.FieldName === 'Notify County');
      return obj ? obj['Value'] : '';
    }),
    field('wfw_Honoree_Country__c', state => {
      const obj = state.data.json.find(js => js.FieldName === 'Notify Country');
      return obj ? obj['Value'] : '';
    }),
    field('npsp__Honoree_Contact__c', state => {
      const obj = state.data.json.find(js => js.FieldName === 'Notify Name');
      return obj ? obj['Value'] : '';
    }),
    field('Tribute_Occasion_Text__c', state => {
      const obj = state.data.json.find(js => js.FieldName === 'Occasion');
      return obj ? obj['Value'] : '';
    }),
    field('wfw_Honoree_Address_1__c', state => {
      const obj = state.data.json.find(js => js.FieldName === 'Notify Add1');
      return obj ? obj['Value'] : '';
    }),
    field('Honoree_Address_2__c', state => {
      const obj = state.data.json.find(js => js.FieldName === 'Notify Add2');
      return obj ? obj['Value'] : '';
    })
  )
);
