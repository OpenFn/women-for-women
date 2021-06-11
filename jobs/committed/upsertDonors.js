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
        console.log(`No match found. Creating Contact for wfw_Legacy_Supporter_ID__c: ${PersonRef}`);
        // When we are here, there is no match so no need to `upsert` ====
        // A `create` should always be enough ============================
        // return create(
        //'Contact',
        return upsertIf(
          dataValue('PrimKey'),
          'Contact',
          'Committed_Giving_ID__c',
          fields(
            field('Committed_Giving_ID__c', dataValue('PrimKey')),
            field('wfw_Legacy_Supporter_ID__c', dataValue('PersonRef')),
            field('Salutation', dataValue('Title')),
            field('FirstName', dataValue('FirstName')),
            field('LastName', dataValue('Surname')),
            field('MailingStreet', address),
            field('MailingCity', dataValue('Address5')),
            field('MailingState', dataValue('Address6')),
            field('MailingPostalCode', state => {
              return dataValue('Postcode')(state) ? dataValue('Postcode')(state).substring(0, 20) : '';
            }),
            field('MailingCountry', dataValue('Country')),
            field('HomePhone', dataValue('TelNumber1')),
            //field('npe01__PreferredPhone__c', dataValue('TelNumber1')),
            field('npe01__PreferredPhone__c', state => {
              let phone = dataValue('TelNumber1')(state);
              if (!phone) return phone ? phone : '0';
            }),

            field('MobilePhone', dataValue('Tel2Number')),
            //field('Email', dataValue('EmailAddress')), // Note: comment this line
            field('Email', state => {
              //const arr = dataValue('EmailAddress')(state).split(' ');
              const email = dataValue('EmailAddress')(state);
              if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) return email;
              return null;
              const arr = dataValue('EmailAddress')(state) ? dataValue('EmailAddress')(state).split(' ') : null;
              if (arr.length > 1) return arr[1];
            }),
            // field('npe01__Preferred_Email__c', dataValue('EmailAddress')), // Note: comment this line
            field('npe01__Preferred_Email__c', state => {
              //const arr = dataValue('EmailAddress')(state).split(' ');
              const email = dataValue('EmailAddress')(state);
              if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) return email;
              return null;
              const arr = dataValue('EmailAddress')(state) ? dataValue('EmailAddress')(state).split(' ') : null;
              if (arr.length > 1) return arr[1];
            }),
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
            field('npsp__Deceased__c', state => {
              return dataValue('Deceased')(state) === 'Yes' ? true : false;
            }),
            field('wfw_Gift_Aid__c', state => {
              // data type in SF is not boolean
              return dataValue('Gift Aid Status')(state) === 'True' ? 'Eligible' : 'Not Eligible - Non Tax Payer';
            }),
            //field('wfw_Date_of_Declaration_Confirmation__c', dataValue('Gift Aid date')), //changed to ISO format
            field('wfw_Date_of_Declaration_Confirmation__c', state => {
              let date = dataValue('Gift Aid date')(state);
              if (!date) return null;
              date = date.split(' ')[0];
              const parts = date.match(/(\d+)/g);
              return parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
            }),
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
          postalCode: dataValue('Postcode')(state) ? dataValue('Postcode')(state).substring(0, 20) : '',
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
          return upsertIf(
            dataValue('PrimKey'),
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
              field('MailingPostalCode', state => {
                return dataValue('Postcode')(state) ? dataValue('Postcode')(state).substring(0, 20) : '';
              }),
              field('MailingCountry', dataValue('Country')),
              field('HomePhone', dataValue('TelNumber1')),
              // field('npe01__PreferredPhone__c', dataValue('TelNumber1')),// changed to below

              field('npe01__PreferredPhone__c', state => {
                let phone = dataValue('TelNumber1')(state);
                if (!phone) return phone ? phone : '0';
              }),

              field('MobilePhone', dataValue('Tel2Number')),
              field('Email', dataValue('EmailAddress')),
              field('npe01__Preferred_Email__c', dataValue('EmailAddress')),
              field('Call_Opt_In__c', state => {
                // not in sandbox
                return dataValue('OK to phone')(state) === 'Yes' ? true : false;
              }),
              field('Email_Opt_in__c', state => {
                return dataValue('OK to email')(state) === 'Yes' ? true : false;
              }),
              field('Mail_Opt_in__c', state => {
                return dataValue('Ok to mail')(state) === 'Yes' ? true : false;
              }),
              field('Text_Opt_In__c', state => {
                //not in sandbox
                return dataValue('Text Opt In')(state) === 'Yes' ? true : false;
              }),
              //field('npsp__Deceased__c', dataValue('Deceased')),// updated to below
              field('npsp__Deceased__c', state => {
                return dataValue('Deceased')(state) === 'Yes' ? true : false;
              }),
              field('wfw_Gift_Aid__c', state => {
                return dataValue('Gift Aid Status')(state) === 'True' ? 'Eligible' : 'Not Eligible - Non Tax Payer';
              }),
              // field('wfw_Date_of_Declaration_Confirmation__c', dataValue('Gift Aid date')),// changed to ISO format
              field('wfw_Date_of_Declaration_Confirmation__c', state => {
                let date = dataValue('Gift Aid date')(state);
                if (!date) return null;
                date = date.split(' ')[0];
                const parts = date.match(/(\d+)/g);
                return parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
              }),

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
