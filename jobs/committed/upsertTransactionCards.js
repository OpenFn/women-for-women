beta.each(
  dataPath('json[*]'),
  upsert(
    'npe01__OppPayment__c',
    'Committed_Giving_ID__c',
    fields(
      field('Committed_Giving_ID__c', state => {
        return dataValue('PrimKey')(state) + dataValue('TransactionReference')(state);
      }),
      relationship('npe01__Opportunity__r', 'Committed_Giving_ID__c', state => {
        return dataValue('PrimKey')(state) + dataValue('CardMasterID')(state);
      }),
      field('CurrencyIsoCode', 'GBP - British Pound'),
      field('npe01__Payment_Method__c', 'Credit Card'),
      field('npe01__Paid__c', true),
      field('npe01__Payment_Date__c', dataValue('Transaction Date')), // Field present twice
      field('npe01__Payment_Amount__c', dataValue('Amount')),
      field('npsp__Payment_Acknowledgment_Status__c', state => {
        return dataValue('Status')(state) === 'Paid' ? 'Acknowledged' : dataValue('Status')(state);
      }),
      relationship('Opportunity_Primary_Campaign_Source__r', 'Source_Code__c', dataValue('PromoCode')),
      field('wfw_Credit_Card_Type__c', dataValue('CCType')),
      field('npe01__Payment_Date__c', dataValue('SettlementDate')) // Field present twicei
    )
  )
);
