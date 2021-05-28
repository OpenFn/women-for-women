beta.each(dataPath('json[*]'), state => {
  return upsert(
    'Opportunity',
    'Committed_Giving_ID__c',
    fields(
      field('Committed_Giving_ID__c', state => {
        return `${dataValue('PrimKey')(state)} ${dataValue('DDRefforBank')(state)} ${dataValue('Date')(state)}`;
      }),
      relationship('RecordType', 'Name', 'Individual_Giving'), // HARDCODED
      relationship('AccountId__r', 'Name', 'test test'), // HARDCODED
      relationship('npsp__Primary_Contact__r', 'Committed_Giving_Id__c', dataValue('PrimKey')),
      field('Name', dataValue('CardMasterID')),
      field('CG_Credit_Card_ID__c', dataValue('CardMasterID')),
      field('CC_Exp_Month__c', state => {
        return dataValue('CCExpiry')(state).split('/')[0];
      }),
      field('CC_Exp_Year__c', state => {
        return dataValue('CCExpiry')(state).split('/')[1];
      }),
      field('Transaction_Reference_Id__c', dataValue('TransactionReference')),
      field('Transaction_Date_Time__c', dataValue('AddedDateTime')),
      field('npe01__Payment_Date__c', dataValue('AddedDateTime')),
      field('Amount', dataValue('Amount')),
      field('CurrencyIsoCode', 'GBP - British Pound'),
      field('StageName', 'Closed Won'),
      field('CloseDate', dataValue('LastCredited'))
    )
  )(state).then(state => {
    return upsert(
      'npe01__OppPayment__c',
      'Committed_Giving_ID__c',
      fields(
        field('Committed_Giving_ID__c', state => {
          return `${dataValue('PrimKey')(state)} ${dataValue('TransactionReference')(state)}`;
        }),
        relationship('npe01__Opportunity__r', 'Committed_Giving_ID__c', state => {
          return `${dataValue('PrimKey')(state)} ${dataValue('CardMasterID')(state)}`;
        }),
        field('CurrencyIsoCode', 'GBP - British Pound'),
        field('npe01__Payment_Method__c', 'Credit Card'),
        field('npe01__Paid__c', true),
        field('npe01__Payment_Date__c', dataValue('AddedDateTime')),
        field('npe01__Payment_Amount__c', dataValue('Amount'))
      )
    )(state);
  });
});
