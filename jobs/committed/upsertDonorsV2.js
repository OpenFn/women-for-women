fn(state => {
  const zipErrors = [];
  const dupErrors = [];
  const dupErrorsDifferentNames = [];
  const dupErrorsFirstNameAddress = [];

  const formatDate = date => {
    if (!date) return null;
    date = date.split(' ')[0];
    const parts = date.match(/(\d+)/g);
    if (!parts) return null;
    const year = String(parts[2]).length > 2 ? parts[2] : `20${parts[2]}`;
    const month = String(parts[1]).length === 2 ? parts[1] : `0${parts[1]}`;
    const day = String(parts[0]).length === 2 ? parts[0] : `0${parts[0]}`;
    return parts ? `${year}-${month}-${day}` : null;
  };

  const baseMapping = (x, address, EmailSF) => {
    // DATA CLEANING ========================================================
    let zipCode = x.Postcode || '';
    if (zipCode && zipCode.length > 20) {
      zipErrors.push(x.Postcode);
      zipCode = x.Postcode.substring(0, 20);
    }

    const OkToPhone = x['OK to phone'] === 'Yes' ? true : false;
    const OkToEmail = x['OK to email'] === 'Yes' ? true : false;
    const OkToMail = x['OK to mail'] === 'Yes' ? true : false;
    const TextOptIn = x['OK to text'] === 'Yes' ? true : false;
    const Deceased = x['Deceased'] === 'Yes' ? true : false;
    const Gift =
      x['Gift Aid Status'] === 'True' || x['Gift Aid Status'] === 'TRUE' || x['Gift Aid Status'] === 'true'
        ? 'Eligible'
        : x['Gift Aid Status'] === 'False' || x['Gift Aid Status'] === 'FALSE' || x['Gift Aid Status'] === 'false'
        ? 'Not Eligible - Non Tax Payer'
        : x['Gift Aid Status'];

    //const CallDate = OkToPhone === true ? x['LastChangedDateTime'] : undefined;
    const CallDate = OkToPhone === true ? x['OK to phone changedate'] : undefined;
    const CallMethod = OkToPhone === true ? 'Online Donation' : undefined;
    //const TextDate = TextOptIn === true ? x['LastChangedDateTime'] : undefined;
    const TextDate = TextOptIn === true ? x['OK to text changedate'] : undefined;
    const TextMethod = TextOptIn === true ? 'Online Donation' : undefined;
    //const EmailDate = OkToEmail === true ? x['LastChangedDateTime'] : undefined;
    const EmailDate = OkToEmail === true ? x['OK to email changedate'] : undefined;
    const EmailMethod = OkToEmail === true ? 'Online Donation' : undefined;
    //const MailDate = OkToMail === true ? x['LastChangedDateTime'] : undefined;
    const MailDate = OkToMail === true ? x['OK to mail changedate'] : undefined;
    const MailMethod = OkToMail === true ? 'Online Donation' : undefined;

    const emailAddress =
      EmailSF !== null
        ? undefined
        : x.EmailAddress
        ? x.EmailAddress.includes('@') &&
          x.EmailAddress.includes('.') &&
          !x.EmailAddress.includes(' ') &&
          !x.EmailAddress.includes('+')
          ? x.EmailAddress
          : `${x.PrimKey}@incomplete.com`
        : `${x.PrimKey}@incomplete.com`;

    // ======================================================================
    return {
      Committed_Giving_ID__c: x.PrimKey,
      wfw_Legacy_Supporter_ID__c: x.PersonRef,
      Salutation: x.Title,
      FirstName: x.FirstName[0].toUpperCase() + x.FirstName.substring(1),
      LastName: x.Surname[0].toUpperCase() + x.Surname.substring(1),
      MailingStreet:
        address === 'Blank' || address === 'No Address'
          ? undefined
          : address
          ? address.replace(/undefined/g, '')
          : address,
      MailingCity: x.Address5,
      MailingState: x.Address6,
      MailingPostalCode: zipCode,
      MailingCountry: x.Country,
      HomePhone: x.TelNumber1,
      npe01__PreferredPhone__c: 'Home',
      MobilePhone: x.Tel2Number,
      npe01__HomeEmail__c: emailAddress,
      npe01__Preferred_Email__c: x.EmailAddress ? 'Personal' : undefined,
      Call_Opt_In__c: OkToPhone,
      Call_Opt_In_Date__c: formatDate(CallDate),
      Call_Opt_In_Method__c: CallMethod,
      Email_Opt_in__c: OkToEmail,
      Email_Opt_In_Date__c: formatDate(EmailDate),
      Email_Opt_In_Method__c: EmailMethod,
      Mail_Opt_in__c: OkToMail,
      Mail_Opt_In_Date__c: formatDate(MailDate),
      Mail_Opt_In_Method__c: MailMethod,
      Text_Opt_In__c: TextOptIn,
      Text_Opt_In_Date__c: formatDate(TextDate),
      Text_Opt_In_Method__c: TextMethod,
      wfw_Method_of_Confirmation__c: 'Online',
      npsp__Deceased__c: Deceased,
      wfw_Gift_Aid__c: Gift,
      wfw_Date_of_Declaration_Confirmation__c: formatDate(x['Gift Aid date']),
      CG_Opt_In_Date__c: formatDate(x['Gift Aid date']),
      wfw_Donor_Source__c: x.DonorSource,
    };
  };
  return {
    ...state,
    zipErrors,
    dupErrors,
    dupErrorsDifferentNames,
    dupErrorsFirstNameAddress,
    formatDate,
    baseMapping,
  };
});

beta.each(
  dataPath('json[*]'),
  fn(async state => {
    const removeSlash = val => val && val.replace(/'/g, "\\'");
    const trimValue = val => val && val.replace(/\s/g, '');
    const firstLetterUppercased = val => {
      if (!val) return val;
      return val[0].toUpperCase() + val.substring(1);
    };

    const { PersonRef, LastChangedDateTime, Surname, PrimKey } = state.data;

    let upsertCondition = 0;

    const checkAddress = address => (address === 'Blank' || address === 'No Address' ? undefined : address);

    let address = `${checkAddress(dataValue('Address1')(state))} ${checkAddress(
      dataValue('Address2')(state)
    )} ${checkAddress(dataValue('Address3')(state))} ${checkAddress(dataValue('Address4')(state))}`;

    address = address
      ? trimValue(
          address
            .replace(/'/g, "\\'")
            .replace(/undefined/g, '')
            .replace(/Blank/g, '')
        )
      : address;

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

    await query(
      `Select Id, FirstName, Email, LastModifiedDate from Contact where Committed_Giving_ID__c = '${PrimKey}'`
    )(state).then(async state => {
      const { records } = state.references[0];

      // if no records then proceed with the dupe-checking flow
      if (records.length === 0) {
        //NOTE: Removed because if PersonRef was NOT defined, then no action taken on Contact
        //if (!state.data.PersonRef) return state;
        await query(
          `SELECT Id, FirstName, LastName, MailingStreet, npe01__HomeEmail__c, HomePhone, wfw_Legacy_Supporter_ID__c, LastModifiedDate 
          FROM CONTACT WHERE wfw_Legacy_Supporter_ID__c = '${trimValue(PersonRef) || 'UNDEFINED'}'`
        )(state).then(async state => {
          const { FirstName, EmailAddress } = state.data;
          //console.log('here2', state.data);
          const sizeLegacyMatch = state.references[0].totalSize;
          const { records } = state.references[0];

          if (sizeLegacyMatch === 0) {
            // A. If no matching Contact has been found...
            await query(
              `SELECT Id, FirstName, Email, npe01__HomeEmail__c, LastName, MailingStreet, LastModifiedDate 
              FROM CONTACT WHERE FirstName = '${trimValue(removeSlash(firstLetterUppercased(FirstName)))}'
              AND Email = '${trimValue(EmailAddress)}'` //AK Change to match on email, not just personal email?
              //AND npe01__HomeEmail__c = '${trimValue(EmailAddress)}'`
            )(state).then(async state => {
              const { records } = state.references[0];
              const sizeEmailMatch = state.references[0].totalSize;

              if (sizeEmailMatch === 0 || originalEmail === '') {
                // A1. If no matching Contact has been found OR if email blank...
                await query(
                  `SELECT Id, FirstName, npe01__HomeEmail__c, LastName, MailingStreet, LastModifiedDate 
                  FROM CONTACT WHERE FirstName = '${trimValue(removeSlash(firstLetterUppercased(FirstName)))}'
                  AND MailingStreet = '${trimValue(address) || 'UNDEFINED'}'`
                )(state).then(async state => {
                  const sizeMailingMatch = state.references[0].totalSize;

                  const EmailSF = null;
                  if (sizeMailingMatch === 0) {
                    // A11. If no matching Contact has been found...
                    if (originalEmail !== '') {
                      await query(
                        `SELECT Id, FirstName, npe01__HomeEmail__c, LastName, MailingStreet, LastModifiedDate 
                      FROM CONTACT WHERE npe01__HomeEmail__c = '${trimValue(EmailAddress)}'`
                      )(state).then(async state => {
                        const { records } = state.references[0];

                        const sizeEmailMatch2 = state.references[0].totalSize;

                        if (sizeEmailMatch2 === 0) {
                          // A111. If no matching Contact has been found...
                          upsertCondition = 1; // We upsert the new contact on Committed_Giving_ID__c
                          return upsertIf(dataValue('PrimKey'), 'Contact', 'Committed_Giving_ID__c', state => ({
                            ...state.baseMapping(state.data, address, EmailSF),
                          }))(state);
                        } else {
                          const FirstNameDup = records[0].FirstName;
                          // A112. If a matching Contact has been found...
                          console.log(`Logging duplicate email: ${email} with different names.`);
                          state.dupErrorsDifferentNames.push(
                            `Logging duplicate email: ${email} with these different names: ['${firstLetterUppercased(
                              FirstName
                            )}' - '${FirstNameDup}' ]`
                          );
                          return state;
                        }
                      });
                    } else {
                      console.log('Upserting new Contact.');
                      return upsertIf(dataValue('PrimKey'), 'Contact', 'Committed_Giving_ID__c', state => ({
                        ...state.baseMapping(state.data, address, EmailSF),
                      }))(state);
                    }
                  } else {
                    // A12. If a matching Contact has been found...
                    // state.dupErrorsFirstNameAddress.push(`${FirstName}-${address}`);
                    state.dupErrorsFirstNameAddress.push(
                      `${firstLetterUppercased(FirstName)} ${firstLetterUppercased(
                        Surname
                      )} with PrimKey: ${PrimKey}, Address: ${address}`
                    );
                    return state;
                  }
                });
              } else {
                console.log('modified', records[0].LastModifiedDate);
                const { LastModifiedDate, Id } = records[0];
                const EmailSF = records[0].npe01__HomeEmail__c;
                // A2. If a matching Contact has been found...
                //if (new Date() > new Date(LastModifiedDate)) { //<-use to override SF details
                if (new Date(LastChangedDateTime) > new Date(LastModifiedDate)) {
                  // If CG is more recent than SF
                  upsertCondition = 2; // We update Contact
                  return upsertIf(dataValue('PrimKey'), 'Contact', 'wfw_Legacy_Supporter_ID__c', state => ({
                    ...state.baseMapping(state.data, address, EmailSF),
                  }))(state);
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
              return upsertIf(dataValue('PrimKey'), 'Contact', 'wfw_Legacy_Supporter_ID__c', state => ({
                ...state.baseMapping(state.data, address, EmailSF),
              }))(state);
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
      } else {
        const { FirstName, LastModifiedDate, Id, Email } = records[0];
        // CG Date is more recent than SF ?
        if (new Date(LastChangedDateTime) > new Date(LastModifiedDate)) {
        //if (new Date() > new Date(LastModifiedDate)) {
          // YES
          email = Email == null ? `${PrimKey}@incomplete.com` : undefined;
          // prettier-ignore
          return update(
            'Contact',
            //AK's test mapping
            // state => ({
            //     ...state.baseMapping(state.data), 
            //     'Id': dataValue('Id')(state),
            //     'Committed_Giving_ID__c': PrimKey,
            //     'npe01__HomeEmail__c': email
            // })
            fields(
              field('Id', Id),
              field('Committed_Giving_ID__c', PrimKey),
              field('npe01__HomeEmail__c', email)
            )
          )(state);
        } else {
          // NO
          const { Surname } = state.data;
          console.log(`Skipping update. Salesforce Contact is more recent for ${PrimKey} - ${FirstName} ${Surname}`);
          return state;
        }
      }
    });
    return state;
  })
);

fn(state => {
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
