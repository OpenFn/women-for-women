beta.each(dataPath('json[*]'), state => {
  return upsert(
    'npe01__OppPayment__c',
    'Committed_Giving_ID__c',
    fields(
      field('Committed_Giving_ID__c', state => {
        return `${dataValue('PrimKey')(state)} ${dataValue('DDRefforBank')(state)}`;
      }),
      relationship('npe01__Opportunity__r', 'Committed_Giving_ID__c', state => {
        return `${dataValue('PrimKey')(state)} ${dataValue('DDRefforBank')(state)}`;
      }),
      field('CurrencyIsoCode', 'GBP'),
      field('npe01__Payment_Method__c', 'Direct Debit'),
      field('npe01__Paid__c', true),
      relationship('Opportunity_Primary_Campaign_Source__r', 'Source_Code__c', dataValue('PromoCode')),
     // field('npe01__Payment_Date__c', dataValue('Date'))// changed to ISO format below
      field('npe01__Payment_Date__c', state => {
        let date = dataValue('Date')(state);
        if (!date) return null;
        date = date.split(' ')[0];
        const parts = date.match(/(\d+)/g);
        return parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
      })
    )
  )(state).then(state => {
    return upsert(
      'Opportunity',
      'Committed_Giving_ID__c',
      fields(
        field('Committed_Giving_ID__c', state => {
          return `${dataValue('PrimKey')(state)} ${dataValue('DDRefforBank')(state)} ${dataValue('Date')(state)}`;
        }),
        field('Account', '0013K00000jOtMNQA0'), // HARDCODED
        field('Amount', dataValue('Amount')),
        field('CurrencyIsoCode', 'GBP'),
        field('StageName', 'Closed Won'),
       // field('CloseDate', dataValue('Date')),// changed to ISO format below
        field('CloseDate', state => {
        let date = dataValue('Date')(state);
         if (!date) return null;
        date = date.split(' ')[0];
        const parts = date.match(/(\d+)/g);
        return parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
      }),
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
