beta.each(
  dataPath('json[*]'),
  alterState(state => {
    const { PersonRef, LastChangedDateTime } = state.data;

    return query(
      `SELECT Id, FirstName, LastName, MailingStreet, Email, HomePhone, wfw_Legacy_Supporter_ID__c, LastModifiedDate from CONTACT WHERE wfw_Legacy_Supporter_ID__c = '${PersonRef}'`
    )(state).then(state => {
      const size = state.references[0].totalSize;
      const { records } = state.references[0];

      const address = `${dataValue('Address1')(state)} ${dataValue('Address2')(state)} ${dataValue('Address3')(
        state
      )} ${dataValue('Address4')(state)}`;

      // If no match
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
            field('MailingStreet', address),
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
        const FirstName = records[0].FirstName;
        const LastName = records[0].LastName;
        const Mailing = records[0].MailingStreet;
        const Email = records[0].Email;
        const TelNumber1 = records[0].HomePhone;
        const LastModifiedDate = records[0].LastModifiedDate;

        // We build our custom address from the attributes from SF
        const customAddress = {
          city: dataValue('Address5')(state),
          country: dataValue('Country')(state),
          postalCode: dataValue('Postcode')(state),
          state: dataValue('Address1')(state),
        };
        if (Mailing) {
          delete Mailing.geocodeAccuracy;
          delete Mailing.latitude;
          delete Mailing.longitude;
          delete Mailing.street;
        }
        // =======================================================

        const perfectMatch =
          FirstName === dataValue('FirstName')(state) &&
          LastName === dataValue('Surname')(state) &&
          Email === dataValue('EmailAddress')(state) &&
          TelNumber1 === dataValue('TelNumber1')(state) &&
          JSON.stringify(Mailing) === JSON.stringify(customAddress);

        if (size === 1 && (perfectMatch || new Date(LastChangedDateTime) > new Date(LastModifiedDate))) {
          console.log('Match found.');
          return upsert(
            'Contact',
            'wfw_Legacy_Supporter_ID__c',
            fields(
              field('Committed_Giving_ID__c', dataValue('PrimKey')),
              field('wfw_Legacy_Supporter_ID__c', dataValue('PersonRef')),
              field('Salutation', dataValue('Title')),
              field('FirstName', dataValue('FirstName')),
              field('LastName', dataValue('Surname')),
              field('MailingStreet', address),
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
        } else if (new Date(LastChangedDateTime) < new Date(LastModifiedDate)) {
          console.log(
            `No Salesforce updates made for Contact with Id ${PersonRef} because Salesforce record has more recently been updated.`
          );
          return state;
        }
        return { ...state, references: [] };
      }
    });
  })
);
