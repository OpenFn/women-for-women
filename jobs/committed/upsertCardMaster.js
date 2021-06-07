beta.each(dataPath('json[*]'), state => {
  const { Occurrence } = state.data;
  if (Occurrence === 'Yearly' || Occurrence === 'Monthly') {
    return upsert(
      'npe03__Recurring_Donation__c',
      'Committed_Giving_ID__c',
      fields(
        field('Committed_Giving_ID__c', state => {
          return dataValue('PrimKey')(state) + dataValue('CardMasterID')(state);
        }),
        //field('Name', dataValue('CardMasterID')),// is this a relationship?
        relationship('npe03__Contact__r', 'Committed_Giving_Id__c', dataValue('PrimKey')),
        field('npe03__Installment_Period__c', dataValue('Occurrence')),
        field('Type__c', 'Recurring Donation'),
        field('npe03__Amount__c', dataValue('Amount')),
        //field('Closeout_Date__c', dataValue('EndDate')),// changed to ISO as below
        field('Closeout_Date__c', state => {
        let date = dataValue('EndDate')(state);
        if (!date) return null;
        date = date.split(' ')[0];
        const parts = date.match(/(\d+)/g);
        return parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
      }),
        //field('npsp__StartDate__c', dataValue('StartDate')),//changed to ISO as below
        field('npsp__StartDate__c', state => {
        let date = dataValue('StartDate')(state);
        if (!date) return null;
        date = date.split(' ')[0];
        const parts = date.match(/(\d+)/g);
        return parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
      }),
      
        //field('npe03__Next_Payment_Date__c', dataValue('NextDate')),//changed to ISO as below
        field('npe03__Next_Payment_Date__c', state => {
        let date = dataValue('NextDate')(state);
        if (!date) return null;
        date = date.split(' ')[0];
        const parts = date.match(/(\d+)/g);
        return parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
      }),
        field('Closeout_Reason__c', dataValue('RecurringCancelReason')),
        //field('Closeout_Date__c', dataValue('RecurringCancelDate')) //changed to ISO format as below
        field('Closeout_Date__c', state => {
        let date = dataValue('RecurringCancelDate')(state);
        if (!date) return null;
        date = date.split(' ')[0];
        const parts = date.match(/(\d+)/g);
        return parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
      }),
      )
    )(state);
  } else {
    return upsert(
      'Opportunity',
      'Committed_Giving_ID__c',
      fields(
        field('Committed_Giving_ID__c', state => {
          return `${dataValue('PrimKey')(state)} ${dataValue('CardMasterID')(state)}`;
        }),
        relationship('RecordType', 'Name', 'Individual Giving'), // HARDCODED
        relationship('Account', 'Name', 'test test'), // HARDCODED
        relationship('npsp__Primary_Contact__r', 'Committed_Giving_Id__c', dataValue('PrimKey')),
       // field('Name', dataValue('CardMasterID')),// is this a relationship?
        field('CG_Credit_Card_ID__c', dataValue('CardMasterID')),
        field('CC_Exp_Month__c', state => {
          return dataValue('CCExpiry')(state).split('/')[0];
        }),
        field('CC_Exp_Year__c', state => {
          return dataValue('CCExpiry')(state).split('/')[1];
        }),
        field('Transaction_Reference_Id__c', dataValue('TransactionReference')),
       // field('Transaction_Date_Time__c', dataValue('AddedDateTime')),// changed to ISO as below
        field('Transaction_Date_Time__c', state => {
        let date = dataValue('AddedDateTime')(state);
        if (!date) return null;
        date = date.split(' ')[0];
        const parts = date.match(/(\d+)/g);
        return parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
      }),
        //field('npe01__Payment_Date__c', dataValue('AddedDateTime')),//changed to ISO as below-- not in oppotunity but in payment object
       // field('npe01__Payment_Date__c', state => {
       // let date = dataValue('AddedDateTime')(state);
        //if (!date) return null;
      //  date = date.split(' ')[0];
       // const parts = date.match(/(\d+)/g);
      //  return parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
    //  }),
        field('Amount', dataValue('Amount')),
        field('CurrencyIsoCode', 'GBP - British Pound'),
        field('StageName', 'Closed Won'),
        //field('CloseDate', dataValue('LastCredited')) //changed to iso as below
        field('CloseDate', state => {
        let date = dataValue('LastCredited')(state);
        if (!date) return null;
        date = date.split(' ')[0];
        const parts = date.match(/(\d+)/g);
        return parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
      }),
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
         // field('npe01__Payment_Date__c', dataValue('AddedDateTime')),// changed to ISO as below
          field('npe01__Payment_Date__c', state => {
        let date = dataValue('AddedDateTime')(state);
        if (!date) return null;
        date = date.split(' ')[0];
        const parts = date.match(/(\d+)/g);
        return parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
      }),
          field('npe01__Payment_Amount__c', dataValue('Amount'))
        )
      )(state);
    });
  }
});