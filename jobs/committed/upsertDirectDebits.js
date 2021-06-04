beta.each(
  dataPath('json[*]'),
  upsert(
    'npe03__Recurring_Donation__c',
    'Committed_Giving_ID__c',
    fields(
      field('Committed_Giving_ID__c', state => {
        return dataValue('PrimKey')(state) + dataValue('DDId')(state);
      }),
      field('Committed_Giving_Direct_Debit_ID__c', dataValue('DDId')),
      relationship('npe03__Contact__r', 'Committed_Giving_Id__c', dataValue('PrimKey')),
      field('Type__c', state => {
        return dataValue('CampaignCode')(state) === 'Sponsorship' ? 'Sponsorship' : 'Recurring Donation';
      }),
      relationship('npe03__Recurring_Donation_Campaign__r', 'Source_Code__c', dataValue('PromoCode')),
      field('npe03__Amount__c', dataValue('Regular amount')),
      field('Status__c', state => {
        return dataValue('Status')(state) === 'live' ? 'Active' : 'Canceled'; // Advise on more transform choices
      }),
      field('npsp__ClosedReason__c', dataValue('CancelReason')),
      field('npe03__Installment_Period__c', dataValue('PaymentFrequency')),
      //field('npsp__InstallmentFrequency__c', dataValue('PaymentFrequency')), //Remove mapping?
      field('npsp__StartDate__c', state => { 
        return new Date(dataValue('StartDate')(state)).toISOString();//not working; returning RangeError
      }),
      field('npe03__Date_Established__c', dataValue('AddedDateTime')),
      field('npe03__Installment_Amount__c', dataValue('FirstAmount')),
      field('npe03__Next_Payment_Date__c', dataValue('NextDate')),
      field('npsp__EndDate__c', dataValue('EndDate')),
      field('of_Sisters_Requested__c', dataValue('Number of sponsorships')),
      field('Committed_Giving_Direct_Debit_Reference__c', dataValue('DDRefforBank'))
    )
  )
);