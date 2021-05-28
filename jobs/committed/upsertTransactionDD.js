beta.each(dataPath('json[*]'), state => {
  return upsert(
    'npe01__OppPayment__c',
    'Committed_Giving_ID__c',
    fields(
      field('Committed_Giving_ID__c', state => {
        return `${dataValue('PrimKey')(state)} ${dataValue('DDRefforBank')(state)}`;
      }),
      field('npe01__Opportunity__r', state => {
        return `${dataValue('PrimKey')(state)} ${dataValue('DDRefforBank')(state)}`;
      }),
      field('CurrencyIsoCode', 'GBP - British Pound'),
      field('npe01__Payment_Method__c', 'Direct Debit'),
      field('npe01__Paid__c', true),
      relationship('Opportunity_Primary_Campaign_Source__r', 'Source_Code__c', dataValue('PromoCode')),
      field('npe01__Payment_Date__c', dataValue('Date'))
    )
  )(state).then(state => {
    return upsert(
      'Opportunity',
      'Committed_Giving_ID__c',
      fields(
        field('Committed_Giving_ID__c', state => {
          return `${dataValue('PrimKey')(state)} ${dataValue('DDRefforBank')(state)} ${dataValue('Date')(state)}`;
        }),
        relationship('AccountId__r', 'Name', 'test test'), // HARDCODED
        field('Amount', dataValue('Amount')),
        field('CurrencyIsoCode', 'GBP - British Pound'),
        field('StageName', 'Closed Won'),
        field('CloseDate', dataValue('Date')),
        field('npsp__ClosedReason__c', dataValue('Unpaid reason'))
      )
    )(state).then(state => {
      return upsert(
        'npe03__Recurring_Donation__c',
        'Committed_Giving_ID__c',
        fields(
          field('Committed_Giving_ID__c', state => {
            return `${dataValue('PrimKey')(state)} ${dataValue('DDRefforBank')(state)}`;
          }),
          field('Committed_Giving_Direct_Debit_Reference__c', dataValue('DDRefforBank')(state))
        )
      )(state);
    });
  });
});
