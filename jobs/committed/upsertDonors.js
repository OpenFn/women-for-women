alterState(state => {
  const zipErrors = [];
  const dupErrors = [];
  const dupErrorsDifferentNames = [];
  const dupErrorsFirstNameAddress = [];
  return { ...state, zipErrors, dupErrors, dupErrorsDifferentNames, dupErrorsFirstNameAddress };
});

beta.each(
  dataPath('json[*]'),
  alterState(async state => {
    const trimValue = val => val && val.replace(/\s/g, '');

    const { PersonRef, LastChangedDateTime } = state.data;

    let upsertCondition = 0;

    const checkAddress = address => (address === 'Blank' ? undefined : address);

    let address = `${checkAddress(dataValue('Address1')(state))} ${checkAddress(
      dataValue('Address2')(state)
    )} ${checkAddress(dataValue('Address3')(state))} ${checkAddress(dataValue('Address4')(state))}`;

    address = address.replace(/'/g, "\\'");

    let email = dataValue('EmailAddress')(state);
    const originalEmail = dataValue('EmailAddress')(state);
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email))
      email = `${dataValue('PrimKey')(state)}@incomplete.com`;

    if (email && email.substring(email.length - 3, email.length - 1) === 'up') {
      // This means it is a duplicated email
      if (state.dupErrors.indexOf(email.substring(0, email.length - 3)) === -1)
        state.dupErrors.push(email.substring(0, email.length - 3));

      return state;
      // throw new Error(`Duplicated email found for ${email}`);
    }
    if (!state.data.PersonRef) return state;

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
    const TextOptIn = dataValue('OK to text')(state) === 'Yes' ? true : false;
    const Deceased = dataValue('Deceased')(state) === 'Yes' ? true : false;
    const Gift = dataValue('Gift Aid Status')(state) === 'True' || dataValue('Gift Aid Status')(state) === 'TRUE' ? 'Eligible' : 'Not Eligible - Non Tax Payer';

    const CallDate = OkToPhone === true ? dataValue('LastChangedDateTime')(state) : undefined;
    const CallMethod = OkToPhone === true ? 'Online Donation' : undefined;
    const TextDate = TextOptIn === true ? dataValue('LastChangedDateTime')(state) : undefined;
    const TextMethod = TextOptIn === true ? 'Online Donation' : undefined;
    const EmailDate = OkToEmail === true ? dataValue('LastChangedDateTime')(state) : undefined;
    const EmailMethod = OkToEmail === true ? 'Online Donation' : undefined;
    const MailDate = OkToMail === true ? dataValue('LastChangedDateTime')(state) : undefined;
    const MailMethod = OkToMail === true ? 'Online Donation' : undefined;

    // ======================================================================

    await query(
      `SELECT Id, FirstName, LastName, MailingStreet, npe01__HomeEmail__c, HomePhone, wfw_Legacy_Supporter_ID__c, LastModifiedDate 
      FROM CONTACT WHERE wfw_Legacy_Supporter_ID__c = '${trimValue(PersonRef)}'`
    )(state).then(async state => {
      const { FirstName, EmailAddress } = state.data;
      const sizeLegacyMatch = state.references[0].totalSize;
      const { records } = state.references[0];

      if (sizeLegacyMatch === 0) {
        // A. If no matching Contact has been found...
        await query(
          `SELECT Id, FirstName, npe01__HomeEmail__c, LastName, MailingStreet, LastModifiedDate 
          FROM CONTACT WHERE FirstName = '${trimValue(FirstName.replace(/'/g, "\\'"))}' 
          AND npe01__HomeEmail__c = '${trimValue(EmailAddress)}'`
        )(state).then(async state => {
          const { records } = state.references[0];
          const sizeEmailMatch = state.references[0].totalSize;

          if (sizeEmailMatch === 0) {
            // A1. If no matching Contact has been found...
            await query(
              `SELECT Id, FirstName, npe01__HomeEmail__c, LastName, MailingStreet, LastModifiedDate 
              FROM CONTACT WHERE FirstName = '${trimValue(FirstName.replace(/'/g, "\\'"))}' 
              AND MailingStreet = '${trimValue(address)}'`
            )(state).then(async state => {
              const sizeMailingMatch = state.references[0].totalSize;

              if (sizeMailingMatch === 0) {
                // A11. If no matching Contact has been found...
                if (originalEmail !== '') {
                  await query(
                    `SELECT Id, FirstName, npe01__HomeEmail__c, LastName, MailingStreet, LastModifiedDate 
                  FROM CONTACT WHERE npe01__HomeEmail__c = '${trimValue(EmailAddress)}'`
                  )(state).then(async state => {
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
                          field('MailingPostalCode', zipCode),
                          field('MailingCountry', dataValue('Country')),
                          field('HomePhone', dataValue('TelNumber1')),

                          field('npe01__PreferredPhone__c', 'Home'),
                          field('MobilePhone', dataValue('Tel2Number')),
                          field('npe01__HomeEmail__c', email),
                          field('npe01__Preferred_Email__c', 'Personal'),
                          field('Call_Opt_In__c', OkToPhone),
                          field('Call_Opt_In_Date__c', CallDate),
                          field('Call_Opt_In_Method__c', CallMethod),
                          field('Email_Opt_in__c', OkToEmail),
                          field('Email_Opt_In_Date__c', EmailDate),
                          field('Email_Opt_In_Method__c', EmailMethod),
                          field('Mail_Opt_in__c', OkToMail),
                          field('Mail_Opt_In_Date__c', MailDate),
                          field('Mail_Opt_In_Method__c', MailMethod),
                          field('Text_Opt_In__c', TextOptIn),
                          field('Mail_Opt_In_Date__c', TextDate),
                          field('Mail_Opt_In_Method__c', TextMethod),
                          field('npsp__Deceased__c', Deceased),
                          field('wfw_Gift_Aid__c', Gift),
                          field('wfw_Date_of_Declaration_Confirmation__c', state => {
                            let date = dataValue('Gift Aid date')(state);
                            if (!date) return null;
                            date = date.split(' ')[0];
                            const parts = date.match(/(\d+)/g);
                            return parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
                          }),
                          field('CG_Opt_In_Date__c', state => {
                            let date = dataValue('Gift Aid date')(state);
                            if (!date) return null;
                            date = date.split(' ')[0];
                            const parts = date.match(/(\d+)/g);
                            return parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
                          }),
                          field('wfw_Donor_Source__c ', dataValue('DonorSource')),
                          field('wfw_Method_of_Confirmation__c', 'Online')
                        )
                      )(state);
                    } else {
                      // A112. If a matching Contact has been found...
                      console.log('Logging duplicate email with different names.');
                      state.dupErrorsDifferentNames.push(email);
                      return state;
                    }
                  });
                } else {
                  console.log('Upserting new Contact.');
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
                      field('MailingPostalCode', zipCode),
                      field('MailingCountry', dataValue('Country')),
                      field('HomePhone', dataValue('TelNumber1')),

                      field('npe01__PreferredPhone__c', 'Home'),
                      field('MobilePhone', dataValue('Tel2Number')),
                      field('npe01__HomeEmail__c', email),
                      field('npe01__Preferred_Email__c', 'Personal'),
                      field('Call_Opt_In__c', OkToPhone),
                      field('Call_Opt_In_Date__c', CallDate),
                      field('Call_Opt_In_Method__c', CallMethod),
                      field('Email_Opt_in__c', OkToEmail),
                      field('Email_Opt_In_Date__c', EmailDate),
                      field('Email_Opt_In_Method__c', EmailMethod),
                      field('Mail_Opt_in__c', OkToMail),
                      field('Mail_Opt_In_Date__c', MailDate),
                      field('Mail_Opt_In_Method__c', MailMethod),
                      field('Text_Opt_In__c', TextOptIn),
                      field('Mail_Opt_In_Date__c', TextDate),
                      field('Mail_Opt_In_Method__c', TextMethod),
                      field('npsp__Deceased__c', Deceased),
                      field('wfw_Gift_Aid__c', Gift),
                      field('wfw_Date_of_Declaration_Confirmation__c', state => {
                        let date = dataValue('Gift Aid date')(state);
                        if (!date) return null;
                        date = date.split(' ')[0];
                        const parts = date.match(/(\d+)/g);
                        return parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
                      }),
                      field('CG_Opt_In_Date__c', state => {
                        let date = dataValue('Gift Aid date')(state);
                        if (!date) return null;
                        date = date.split(' ')[0];
                        const parts = date.match(/(\d+)/g);
                        return parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
                      }),
                      field('wfw_Donor_Source__c ', dataValue('DonorSource')),
                      field('wfw_Method_of_Confirmation__c', 'Online')
                    )
                  )(state);
                }
              } else {
                // A12. If a matching Contact has been found...
                state.dupErrorsFirstNameAddress.push(`${FirstName}-${address}`);
                return state;
              }
            });
          } else {
            console.log('modified', records[0].LastModifiedDate);
            const { LastModifiedDate, Id } = records[0];
            const EmailSF = records[0].npe01__HomeEmail__c;
            // A2. If a matching Contact has been found...
            if (new Date(LastChangedDateTime) > new Date(LastModifiedDate)) {
              // If CG is more recent than SF
              upsertCondition = 2; // We update Contact
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
                  field('MailingPostalCode', zipCode),
                  field('MailingCountry', dataValue('Country')),
                  field('HomePhone', dataValue('TelNumber1')),

                  field('npe01__PreferredPhone__c', 'Home'),
                  field('MobilePhone', dataValue('Tel2Number')),
                  field('npe01__HomeEmail__c', state => {
                    if (EmailSF !== null) return undefined;
                    return email;
                  }),
                  field('npe01__Preferred_Email__c', 'Personal'),
                  /*state => {
                    if (EmailSF !== null) return undefined;
                    return email;
                  }),*/
                  field('Call_Opt_In__c', OkToPhone),
                  field('Call_Opt_In_Date__c', CallDate),
                  field('Call_Opt_In_Method__c', CallMethod),
                  field('Email_Opt_in__c', OkToEmail),
                  field('Email_Opt_In_Date__c', EmailDate),
                  field('Email_Opt_In_Method__c', EmailMethod),
                  field('Mail_Opt_in__c', OkToMail),
                  field('Mail_Opt_In_Date__c', MailDate),
                  field('Mail_Opt_In_Method__c', MailMethod),
                  field('Text_Opt_In__c', TextOptIn),
                  field('Mail_Opt_In_Date__c', TextDate),
                  field('Mail_Opt_In_Method__c', TextMethod),
                  field('npsp__Deceased__c', Deceased),
                  field('wfw_Gift_Aid__c', Gift),
                  field('wfw_Date_of_Declaration_Confirmation__c', state => {
                    let date = dataValue('Gift Aid date')(state);
                    if (!date) return null;
                    date = date.split(' ')[0];
                    const parts = date.match(/(\d+)/g);
                    return parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
                  }),
                  field('CG_Opt_In_Date__c', state => {
                    let date = dataValue('Gift Aid date')(state);
                    if (!date) return null;
                    date = date.split(' ')[0];
                    const parts = date.match(/(\d+)/g);
                    return parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
                  }),
                  field('wfw_Donor_Source__c ', dataValue('DonorSource')),
                  field('wfw_Method_of_Confirmation__c', 'Online')
                )
              )(state);
            } else {
              upsertCondition = 3; // We update contact but only Committed_Giving_ID__c
              console.log('SF Contact is more recently updated than the CG contact. Skipping update.');
              return update(
                'Contact',
                fields(field('Id', Id), field('Committed_Giving_ID__c', dataValue('PrimKey')))
              )(state);
            }
          }
        });
      } else {
        const { LastModifiedDate, Id } = records[0];
        const EmailSF = records[0].npe01__HomeEmail__c;
        // B. If a matching Contact has been found...
        if (new Date(LastChangedDateTime) > new Date(LastModifiedDate)) {
          // If CG is more recent than SF
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
              field('MailingPostalCode', zipCode),
              field('MailingCountry', dataValue('Country')),
              field('HomePhone', dataValue('TelNumber1')),

              field('npe01__PreferredPhone__c', 'Home'),
              field('MobilePhone', dataValue('Tel2Number')),
              field('npe01__HomeEmail__c', state => {
                if (EmailSF !== null) return undefined;
                return email;
              }),
              field('npe01__Preferred_Email__c', 'Personal') /*state => {
                if (EmailSF !== null) return undefined;
                return email;
              }),*/,
              field('Call_Opt_In__c', OkToPhone),
              field('Call_Opt_In_Date__c', CallDate),
              field('Call_Opt_In_Method__c', CallMethod),
              field('Email_Opt_in__c', OkToEmail),
              field('Email_Opt_In_Date__c', EmailDate),
              field('Email_Opt_In_Method__c', EmailMethod),
              field('Mail_Opt_in__c', OkToMail),
              field('Mail_Opt_In_Date__c', MailDate),
              field('Mail_Opt_In_Method__c', MailMethod),
              field('Text_Opt_In__c', TextOptIn),
              field('Mail_Opt_In_Date__c', TextDate),
              field('Mail_Opt_In_Method__c', TextMethod),
              field('npsp__Deceased__c', Deceased),
              field('wfw_Gift_Aid__c', Gift),
              field('wfw_Date_of_Declaration_Confirmation__c', state => {
                let date = dataValue('Gift Aid date')(state);
                if (!date) return null;
                date = date.split(' ')[0];
                const parts = date.match(/(\d+)/g);
                return parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
              }),
              field('CG_Opt_In_Date__c', state => {
                let date = dataValue('Gift Aid date')(state);
                if (!date) return null;
                date = date.split(' ')[0];
                const parts = date.match(/(\d+)/g);
                return parts ? new Date(parts[2], parts[1] - 1, parts[0]).toISOString() : parts;
              }),
              field('wfw_Donor_Source__c ', dataValue('DonorSource')),
              field('wfw_Method_of_Confirmation__c', 'Online')
            )
          )(state);
        } else {
          // upsertCondition = 3; // We update contact but only Committed_Giving_ID__c
          console.log('SF Contact is more recently updated than the CG contact. Skipping update.');
          return update(
            'Contact',
            fields(field('Id', Id), field('Committed_Giving_ID__c', dataValue('PrimKey')))
          )(state);
        }
      }
    });
    return state;
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
