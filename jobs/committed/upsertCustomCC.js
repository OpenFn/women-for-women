upsert(
  'Opportunity',
  'CG_Credit_Card_ID__c', //CHANGE TO CG_Credit_Card_ID__c ?
  fields(
    field('CG_Credit_Card_ID__c', dataValue('CCID')),
    field('npsp__Tribute_Type__c', state => {
      const obj = state.data.json.find(js => js.FieldName === 'FormName');
      return obj ? obj['Value'] : '';
    }),
    field('Tribute_Occasion_Text__c', state => {
      const obj = state.data.json.find(js => js.FieldName === 'Occasion');
      return obj ? obj['Value'] : '';
    }),
    field('npsp__Honoree_Name__c', state => {
      const obj = state.data.json.find(js => js.FieldName === 'Honouree / Tributee Name');
      return obj ? obj['Value'] : '';
    }),
    field('Paper_Card_Shipping_City__c', state => {
      const obj = state.data.json.find(js => js.FieldName === 'Notify Town');
      return obj ? obj['Value'] : '';
    }),
    field('Paper_Card_Shipping_Zip_Postal__c', state => {
      const obj = state.data.json.find(js => js.FieldName === 'Notify Postcode');
      return obj ? obj['Value'] : '';
    }),
    field('Paper_Card_Shipping_State_Province__c', state => {
      const obj = state.data.json.find(js => js.FieldName === 'Notify County');
      return obj ? obj['Value'] : '';
    }),
    field('Paper_Card_Shipping_Country__c', state => {
      const obj = state.data.json.find(js => js.FieldName === 'Notify Country');
      return obj ? obj['Value'] : '';
    }),
    field('Paper_Card_Shipping_Name__c', state => {
      const obj = state.data.json.find(js => js.FieldName === 'Notify Name');
      return obj ? obj['Value'] : '';
    }),
    field('Paper_Card_Shipping_Address__c', state => {
      const obj = state.data.json.find(js => js.FieldName === 'Notify Add1');
      return obj ? obj['Value'] : '';
    }),
    field('Paper_Card_Shipping_Address_Line_2__c', state => {
      const obj = state.data.json.find(js => js.FieldName === 'Notify Add2');
      return obj ? obj['Value'] : '';
    }),
    field('eCard_Recipient_Email__c', state => {
      const obj = state.data.json.find(js => js.FieldName === 'Notify Email Address');
      return obj ? obj['Value'] : '';
    })
  )
);
