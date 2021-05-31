beta.each(
  dataPath('json[*]'),
  alterState(state => {
    const { PersonRef } = state.data;

    return query(
      `SELECT Id, FirstName, LastName, MailingAddress, HomePhone, wfw_Legacy_Supporter_ID__c, LastModifiedDate from CONTACT WHERE wfw_Legacy_Supporter_ID__c = '${PersonRef}'`
    )(state).then(state => {
      console.log('state', state.references[0]);
      const size = state.references[0].totalSize;
      // If no match...
      if (size === 0) {
        console.log(`No match found. Upserting Contact ${PersonRef}`);
        return upsert(
          'Contact',
          'wfw_Legacy_Supporter_ID__c',
          fields(
            field('Committed_Giving_ID__c', dataValue('PrimKey')),
            field('wfw_Legacy_Supporter_ID__c', dataValue('PersonRef')),
            field('Salutation', dataValue('Title')),
            field('FirstName', dataValue('FirstName')),
            field('LastName', dataValue('Surname')),
            field('MailingAddress', state => {
              const address = `${dataValue('Address1')(state)} ${dataValue('Address2')(state)} ${dataValue('Address3')(
                state
              )} ${dataValue('Address4')(state)}`;
              return address;
            }),
            field('MailingCity', dataValue('Address5')),
            field('MailingState', dataValue('Address6')),
            field('MailingPostalCode', dataValue('Postcode')),
            field('MailingCountry', dataValue('Country')),
            field('HomePhone', dataValue('TelNumber1')),
            field('npe01__PreferredPhone__c', dataValue('TelNumber1')),
            field('MobilePhone', dataValue('Tel2Number')),
            field('Email', dataValue('EmailAddress')),
            field('npe01__Preferred_Email__c', dataValue('EmailAddress')),
            field('Call_Opt_In__c', state => {
              return dataValue('OK to phone')(state) === 'Yes' ? true : false;
            }),
            field('Email_Opt_in__c', state => {
              return dataValue('OK to email')(state) === 'Yes' ? true : false;
            }),
            field('Mail_Opt_in__c', state => {
              return dataValue('Ok to mail')(state) === 'Yes' ? true : false;
            }),
            field('Text_Opt_In__c', state => {
              return dataValue('Text Opt In')(state) === 'Yes' ? true : false;
            }),
            field('npsp__Deceased__c', dataValue('Deceased')),
            field('wfw_Gift_Aid__c', state => {
              return dataValue('Gift Aid Status')(state) === 'True' ? 'Eligible' : 'Not Eligible - Non Tax Payer';
            }),
            field('wfw_Date_of_Declaration_Confirmation__c', dataValue('Gift Aid date')),
            field('wfw_Donor_Source__c ', dataValue('DonorSource'))
          )
        )(state);
      } else {
        return { ...state, references: [] };
      }
    });
  })
);
