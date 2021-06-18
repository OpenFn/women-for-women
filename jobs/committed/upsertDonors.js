alterState(state => {
  const zipErrors = [];
  const dupErrors = [];
  const dupErrorsDifferentNames = [];
  const dupErrorsFirstNameAddress = [];
  return { ...state, zipErrors, dupErrors, dupErrorsDifferentNames, dupErrorsFirstNameAddress };
});

beta.each(
  dataPath('json[*]'),
  alterState(state => {
    const { PersonRef, LastChangedDateTime } = state.data;

    let upsertCondition = 0;

    const address = `${dataValue('Address1')(state)} ${dataValue('Address2')(state)} ${dataValue('Address3')(
      state
    )} ${dataValue('Address4')(state)}`;

    if (email && email.substring(email.length - 3, email.length - 1) === 'up') {
      // This means it is a duplicated email
      if (state.dupErrors.indexOf(email.substring(0, email.length - 3)) === -1)
        state.dupErrors.push(email.substring(0, email.length - 3));

      throw new Error('Duplicated email found.');
    }

    // DATA CLEANING ========================================================
    let zipCode = dataValue('Postcode')(state) || '';
    if (zipCode && zipCode.length > 20) {
      state.zipErrors.push(dataValue('Postcode')(state));
      zipCode = dataValue('Postcode')(state).substring(0, 20);
    }
    const phone = dataValue('TelNumber1')(state) ? dataValue('TelNumber1')(state) : '0';

    const OkToPhone = dataValue('OK to phone')(state) === 'Yes' ? true : false;
    const OkToEmail = dataValue('OK to email')(state) === 'Yes' ? true : false;
    const OkToMail = dataValue('OK to mail')(state) === 'Yes' ? true : false;
    const TextOptIn = dataValue('Text Opt In')(state) === 'Yes' ? true : false;
    const Deceased = dataValue('Deceased')(state) === 'Yes' ? true : false;
    const Gift = dataValue('Gift Aid Status')(state) === 'True' ? 'Eligible' : 'Not Eligible - Non Tax Payer';

    let email = dataValue('EmailAddress')(state);
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email))
      email = `${dataValue('PrimKey')(state)}@incomplete.com`;

    // ======================================================================

    return query(
      `SELECT Id, FirstName, LastName, MailingStreet, Email, HomePhone, wfw_Legacy_Supporter_ID__c, LastModifiedDate 
      FROM CONTACT WHERE wfw_Legacy_Supporter_ID__c = '${PersonRef}'`
    )(state).then(state => {
      const { FirstName, EmailAddress } = state.data;
      const sizeLegacyMatch = state.references[0].totalSize;
      const { records } = state.references[0];
      let LastModifiedDate = records[0].LastModifiedDate;
      const EmailSF = records[0].Email;

      if (sizeLegacyMatch === 0) {
        // A. If no matching Contact has been found...
        return query(
          `SELECT Id, FirstName, Email, LastName, MailingStreet, LastModifiedDate 
          FROM CONTACT WHERE FirstName = '${FirstName}' 
          AND Email = '${EmailAddress}'`
        )(state).then(state => {
          const sizeEmailMatch = state.references[0].totalSize;
          LastModifiedDate = records[0].LastModifiedDate;

          if (sizeEmailMatch === 0) {
            // A1. If no matching Contact has been found...
            return query(
              `SELECT Id, FirstName, Email, LastName, MailingStreet, LastModifiedDate 
              FROM CONTACT WHERE FirstName = '${FirstName}' 
              AND MailingStreet = '${address}'`
            )(state).then(state => {
              const sizeMailingMatch = state.references[0].totalSize;

              if (sizeMailingMatch === 0) {
                // A11. If no matching Contact has been found...
                return query(
                  `SELECT Id, FirstName, Email, LastName, MailingStreet, LastModifiedDate 
                  FROM CONTACT WHERE Email = '${EmailAddress}'`
                )(state).then(state => {
                  const sizeEmailMatch2 = state.references[0].totalSize;

                  if (sizeEmailMatch2 === 0) {
                    // A111. If no matching Contact has been found...
                    upsertCondition = 1; // We upsert the new contact on Committed_Giving_ID__c
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
              const zipCode = dataValue('Postcode')(state);
              if (zipCode && zipCode.length > 20) {
                state.zipErrors.push(dataValue('Postcode')(state));
              }
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
              const email = dataValue('EmailAddress')(state);
              if (email && email.substring(email.length - 3, email.length - 1) === 'up') {
                if (state.dupErrors.indexOf(email.substring(0, email.length - 3)) === -1)
                  state.dupErrors.push(email.substring(0, email.length - 3));
              }
              if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) return email;
              return `${dataValue('PrimKey')(state)}@incomplete.com`;
            }),
            // field('npe01__Preferred_Email__c', dataValue('EmailAddress')), // Note: comment this line
            field('npe01__Preferred_Email__c', state => {
              const email = dataValue('EmailAddress')(state);
              if (email && email.substring(email.length - 3, email.length - 1) === 'up') {
                if (state.dupErrors.indexOf(email.substring(0, email.length - 3)) === -1)
                  state.dupErrors.push(email.substring(0, email.length - 3));
              }
              if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) return email;
              return `${dataValue('PrimKey')(state)}@incomplete.com`;
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
                const zipCode = dataValue('Postcode')(state);
                if (zipCode && zipCode.length > 20) {
                  state.zipErrors.push(dataValue('Postcode')(state));
                }
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
              field('Email', state => {
                const email = dataValue('EmailAddress')(state);
                // if email is duplicated, we add to the errors array
                if (email && email.substring(email.length - 3, email.length - 1) === 'up') {
                  if (state.dupErrors.indexOf(email.substring(0, email.length - 3)) === -1)
                    state.dupErrors.push(email.substring(0, email.length - 3));
                }
                if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) return email;
                return `${dataValue('PrimKey')(state)}@incomplete.com`;
              }),
              field('npe01__Preferred_Email__c', state => {
                const email = dataValue('EmailAddress')(state);
                if (email && email.substring(email.length - 3, email.length - 1) === 'up') {
                  if (state.dupErrors.indexOf(email.substring(0, email.length - 3)) === -1)
                    state.dupErrors.push(email.substring(0, email.length - 3));
                }
                if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) return email;
                return `${dataValue('PrimKey')(state)}@incomplete.com`;
              }),
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
        } else {
          // upsertCondition = 3; // We update contact but only Committed_Giving_ID__c
          return upsertIf(
            dataValue('PrimKey'),
            'Contact',
            'Committed_Giving_ID__c',
            fields(field('Committed_Giving_ID__c', dataValue('PrimKey')))
          )(state);
        }
        return { ...state, references: [] };
      }
    });
  })
);

alterState(state => {
  const error = [];
  if (state.zipErrors.length > 0) {
    console.log(JSON.stringify(state.zipErrors, null, 2));
    error.push('Errors detected on mailing postal code.');
  }
  if (state.dupErrors.length > 0) {
    console.log(JSON.stringify(state.dupErrors, null, 2));
    error.push('Errors detected on duplicated emails.');
  }
  if (state.dupErrorsDifferentNames.length > 0) {
    console.log(JSON.stringify(state.dupErrorsDifferentNames, null, 2));
    error.push('Errors detected on duplicated emails with different names.');
  }
  if (state.dupErrorsFirstNameAddress.length > 0) {
    console.log(JSON.stringify(state.dupErrorsFirstNameAddress, null, 2));
    error.push('Errors detected on duplicated firstname and address.');
  }

  if (error.length > 0) throw new Error(error.join('\n'));

  return state;
});
