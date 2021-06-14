beta.each(dataPath('json[*]'), state => {
  let date = dataValue('Date')(state) ? dataValue('Date')(state).split(' ')[0] : null;
  let dateField = null;
  if (date) {
    const parts = date.match(/(\d+)/g);
    dateField = parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
  }
  const id = `${dataValue('PrimKey')(state)} ${dataValue('DDRefforBank')(state)}`;

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
      field('CloseDate', dateField),
      field('npsp__ClosedReason__c', dataValue('Unpaid reason'))
    )
  )(state).then(state => {
    return upsert(
      'npe03__Recurring_Donation__c',
      'Committed_Giving_ID__c',
      fields(
        field('Committed_Giving_ID__c', id),
        field('Committed_Giving_Direct_Debit_Reference__c', dataValue('DDRefforBank')(state))
      )
    )(state).then(state => {
      const { PrimKey, DDRefforBank } = state.data;

      return query(`SELECT Id FROM npe01__OppPayment__c WHERE Committed_Giving_ID__c = '${PrimKey}${DDRefforBank}'`)(
        state
      ).then(state => {
        const { totalSize } = state.references[0];

        if (totalSize > 0) {
          return update(
            'npe01__OppPayment__c',
            fields(
              field('Committed_Giving_ID__c', id),
              relationship('npe01__Opportunity__r', 'Committed_Giving_ID__c', id),
              field('CurrencyIsoCode', 'GBP'),
              field('npe01__Payment_Method__c', 'Direct Debit'),
              field('npe01__Paid__c', true),
              relationship('Opportunity_Primary_Campaign_Source__r', 'Source_Code__c', dataValue('PromoCode')),
              // field('npe01__Payment_Date__c', dataValue('Date'))// changed to ISO format below
              field('npe01__Payment_Date__c', dateField)
            )
          )(state);
        } else {
          return create(
            'npe01__OppPayment__c',
            fields(
              field('Committed_Giving_ID__c', id),
              relationship('npe01__Opportunity__r', 'Committed_Giving_ID__c', id),
              field('CurrencyIsoCode', 'GBP'),
              field('npe01__Payment_Method__c', 'Direct Debit'),
              field('npe01__Paid__c', true),
              relationship('Opportunity_Primary_Campaign_Source__r', 'Source_Code__c', dataValue('PromoCode')),
              // field('npe01__Payment_Date__c', dataValue('Date'))// changed to ISO format below
              field('npe01__Payment_Date__c', dateField)
            )
          )(state);
        }
      });
    });
  });
});
