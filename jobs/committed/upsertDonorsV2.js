fn(state => {
  const zipErrors = [];
  const dupErrors = [];
  const dupErrorsDifferentNames = [];
  const dupErrorsFirstNameAddress = [];

  const formatDate = date => {
    //to clean CG date format
    if (!date) return null;
    date = date.split(' ')[0];
    const parts = date.match(/(\d+)/g);
    if (!parts) return null;
    const year = String(parts[2]).length > 2 ? parts[2] : `20${parts[2]}`;
    const month = String(parts[1]).length === 2 ? parts[1] : `0${parts[1]}`;
    const day = String(parts[0]).length === 2 ? parts[0] : `0${parts[0]}`;
    return parts ? `${year}-${month}-${day}` : null;
  };

  const firstLetterUppercased = val => {
    if (!val) return val;
    return val[0].toUpperCase() + val.substring(1);
  };
  const baseMapping = (x, address, EmailSF) => {
    // DATA CLEANING LOGIC =====================================================
    let zipCode = x.Postcode || '';
    if (zipCode && zipCode.length > 20) {
      zipErrors.push(x.Postcode);
      zipCode = x.Postcode.substring(0, 20);
    }

    const Deceased = x['Deceased'] === 'Yes' ? true : false;
    const Gift =
      x['Gift Aid Status'] === 'True' || x['Gift Aid Status'] === 'TRUE' || x['Gift Aid Status'] === 'true'
        ? 'Eligible'
        : x['Gift Aid Status'] === 'False' || x['Gift Aid Status'] === 'FALSE' || x['Gift Aid Status'] === 'false'
        ? 'Not Eligible - Non Tax Payer'
        : x['Gift Aid Status'];

    //======= Comms Methods & Opt-Ins =======================//
    const OkToPhone = x['OK to phone'];
    const OkToEmail = x['OK to email'];
    const OkToMail = x['OK to mail'];
    const OkToText = x['OK to text'];
    const CallDate = formatDate(x['OK to phone changedate']);
    const TextDate = formatDate(x['OK to text changedate']);
    const MailDate = formatDate(x['OK to mail changedate']);
    const EmailDate = formatDate(x['OK to email changedate']);

    const CallMethod = OkToPhone === true ? 'Online Donation' : undefined;
    const TextMethod = OkToText === true ? 'Online Donation' : undefined;
    const EmailMethod = OkToEmail === true ? 'Online Donation' : undefined;
    const MailMethod = OkToMail === true ? 'Online Donation' : undefined;

    const dayBefore = () => {
      let d = new Date();
      d.setDate(d.getDate() - 2); //-2 = day before yesterday
      return d.toISOString().split('T')[0];
    };

    //Is the CG OptIn "changeDate" a newer date? (Meaning we should update comm options in Salesforce)
    const checkNewDate = changeDate => {
      var dayBeforeSync = dayBefore();
      //console.log('changeDate formatted ::', changeDate);
      if (changeDate >= dayBeforeSync) {
        //console.log('changeDate is new? TRUE');
        return true;
      } else {
        //console.log('changeDate is new? FALSE');
        return false;
      }
    };

    //Logic to set Salesforce 'Opt In' fields depending on if the CG change is new and has a changedate
    function OptInCheck(OkToContact, ChangeDate) {
      const result =
        OkToContact === 'Yes' && checkNewDate(ChangeDate) === true
          ? true
          : OkToContact === 'No' && checkNewDate(ChangeDate) === true
          ? false
          : undefined;
      // console.log('OkToContact ::', OkToContact);
      // console.log('ChangeDate ::', ChangeDate);
      // console.log('Opt In Result?', result);
      return result;
    }

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
    // Contact field mappings
    return {
      Committed_Giving_ID__c: x.PrimKey,
      wfw_Legacy_Supporter_ID__c: x.PersonRef && x.PersonRef !== '' ? x.PersonRef : undefined,
      Salutation: x.Title,
      FirstName: firstLetterUppercased(x.FirstName),
      LastName: firstLetterUppercased(x.Surname),
      MailingStreet: address === 'Blank' || address === 'No Address' ? undefined : address,
      MailingCity: x.Address5 ? x.Address5.trim() : x.Address5,
      MailingState: x.Address6 ? x.Address6.trim() : x.Address6,
      MailingPostalCode: zipCode,
      MailingCountry: x.Country,
      HomePhone: x.TelNumber1,
      npe01__PreferredPhone__c: 'Home',
      MobilePhone: x.Tel2Number,
      npe01__HomeEmail__c: emailAddress,
      npe01__Preferred_Email__c: x.EmailAddress ? 'Personal' : undefined,
      Call_Opt_In__c: OptInCheck(OkToPhone, CallDate),
      Call_Opt_In_Date__c: OptInCheck(OkToPhone, CallDate) ? CallDate : undefined,
      Call_Opt_In_Method__c: CallMethod,
      Email_Opt_in__c: OptInCheck(OkToEmail, EmailDate),
      Email_Opt_In_Date__c: OptInCheck(OkToEmail, EmailDate) ? EmailDate : undefined,
      Email_Opt_In_Method__c: EmailMethod,
      Mail_Opt_in__c: OptInCheck(OkToMail, MailDate),
      Mail_Opt_In_Date__c: OptInCheck(OkToMail, MailDate) ? MailDate : undefined,
      Mail_Opt_In_Method__c: MailMethod,
      Text_Opt_In__c: OptInCheck(OkToText, TextDate),
      Text_Opt_In_Date__c: OptInCheck(OkToText, TextDate) ? TextDate : undefined,
      Text_Opt_In_Method__c: TextMethod,
      wfw_Method_of_Confirmation__c: 'Online',
      npsp__Deceased__c: Deceased,
      wfw_Gift_Aid__c: Gift,
      wfw_Date_of_Declaration_Confirmation__c: formatDate(x['Gift Aid date']),
      CG_Opt_In_Date__c: formatDate(x['Gift Aid date']),
      wfw_Donor_Source__c: x.DonorSource && x.DonorSource !== '' ? x.DonorSource : undefined,
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
    firstLetterUppercased,
  };
});

beta.each(
  dataPath('json[*]'),
  fn(async state => {
    const removeSlash = val => val && val.replace(/'/g, "\\'");
    const trimValue = val => val && val.replace(/\s/g, '');
    const { firstLetterUppercased } = state;

    const { PersonRef, LastChangedDateTime, Surname, PrimKey } = state.data;

    let upsertCondition = 0;

    const checkAddress = address => (address === 'Blank' || address === 'No Address' ? undefined : address);

    let address = `${checkAddress(dataValue('Address1')(state))}_${checkAddress(
      dataValue('Address2')(state)
    )}_${checkAddress(dataValue('Address3')(state))}_${checkAddress(dataValue('Address4')(state))}`;

    console.log('address PRE-formatting ::', address);

    address = address
      ? address
          .replace(/'/g, "\\'")
          .replace(/undefined/g, '')
          .replace(/Blank/g, '')
          .replace(/____/g, '')
          .replace(/___/g, '')
          .replace(/__/g, '_')
          .replace(/_/g, ', ')
          .trim()
      : address;
    console.log('address POST-formatting ::', address);

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
      // ^removed because we now check for dupe emails in the first job where we GET csvs
    }

    await query(
      `Select Id, FirstName, Email, LastModifiedDate, wfw_Donor_Source__c, wfw_Legacy_Supporter_ID__c, Committed_Giving_ID__c from Contact where Committed_Giving_ID__c = '${PrimKey}'`
    )(state).then(async state => {
      const { records } = state.references[0];

      // if no records then proceed with the dupe-checking flow
      if (records.length === 0) {
        //NOTE: Removed because if PersonRef was NOT defined, then no action taken on Contact
        //if (!state.data.PersonRef) return state;
        await query(
          `SELECT Id, FirstName, LastName, MailingStreet, npe01__HomeEmail__c, HomePhone, wfw_Legacy_Supporter_ID__c, wfw_Donor_Source__c, LastModifiedDate 
          FROM CONTACT WHERE wfw_Legacy_Supporter_ID__c = '${trimValue(PersonRef) || 'UNDEFINED'}'`
        )(state).then(async state => {
          const { FirstName, EmailAddress, address } = state.data;
          const sizeLegacyMatch = state.references[0].totalSize;
          const { records } = state.references[0];

          if (sizeLegacyMatch === 0) {
            // A. If no matching Contact has been found...
            await query(
              `SELECT Id, FirstName, Email, npe01__HomeEmail__c, LastName, MailingStreet, LastModifiedDate, wfw_Legacy_Supporter_ID__c, wfw_Donor_Source__c 
              FROM CONTACT WHERE FirstName = '${trimValue(removeSlash(firstLetterUppercased(FirstName)))}'
              AND Email = '${trimValue(EmailAddress)}'` //AK Change to match on email, not just personal email?
              //AND npe01__HomeEmail__c = '${trimValue(EmailAddress)}'`
            )(state).then(async state => {
              const { records } = state.references[0];
              const sizeEmailMatch = state.references[0].totalSize;

              if (sizeEmailMatch === 0 || originalEmail === '') {
                // A1. If no matching Contact has been found OR if email blank...
                await query(
                  `SELECT Id, FirstName, npe01__HomeEmail__c, LastName, MailingStreet, LastModifiedDate, wfw_Legacy_Supporter_ID__c, wfw_Donor_Source__c 
                  FROM CONTACT WHERE FirstName = '${trimValue(removeSlash(firstLetterUppercased(FirstName)))}'
                  AND MailingStreet = '${trimValue(address) || 'UNDEFINED'}'`
                )(state).then(async state => {
                  const sizeMailingMatch = state.references[0].totalSize;

                  const EmailSF = null;
                  if (sizeMailingMatch === 0) {
                    // A11. If no matching Contact has been found...
                    if (originalEmail !== '') {
                      await query(
                        `SELECT Id, FirstName, npe01__HomeEmail__c, LastName, MailingStreet, LastModifiedDate, wfw_Legacy_Supporter_ID__c, wfw_Donor_Source__c 
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
                          const SupportIDSF = records[0].wfw_Legacy_Supporter_ID__c;
                          const donorSource = records[0].wfw_Donor_Source__c;
                          // A112. If a matching Contact has been found...
                          console.log(`Logging duplicate email: ${email} with different names.`);
                          upsertCondition = 1; // We upsert the new contact on Committed_Giving_ID__c
                          return upsertIf(dataValue('PrimKey'), 'Contact', 'wfw_Legacy_Supporter_ID__c', state => ({
                            ...state.baseMapping(state.data, address, EmailSF),
                            FirstName: FirstNameDup,
                            wfw_Legacy_Supporter_ID__c: SupportIDSF,
                            wfw_Donor_Source__c: donorSource,
                          }))(state);
                          // state.dupErrorsDifferentNames.push(
                          //   `Logging duplicate email: ${email} with these different names: ['${firstLetterUppercased(
                          //     FirstName
                          //   )}' - '${FirstNameDup}' ]`
                          // );
                          // return state;
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
                const SupportIDSF = records[0].wfw_Legacy_Supporter_ID__c;
                const donorSource = records[0].wfw_Donor_Source__c;
                // A2. If a matching Contact has been found...
                /*OLD ::*/ //if (new Date(LastChangedDateTime) > new Date(LastModifiedDate)) { //OLD condition: If CG data is more recent than SF
                //NEW condition: If today is more recent than SF data
                if (EmailSF) {
                  //<-use to override SF details if we want to compare today's date with CG date
                  console.log('Matching SF Contact found. Updating with CG donor profile details...');
                  upsertCondition = 2; // We update Contact
                  return upsertIf(dataValue('PrimKey'), 'Contact', 'wfw_Legacy_Supporter_ID__c', state => ({
                    ...state.baseMapping(state.data, address, EmailSF),
                    wfw_Legacy_Supporter_ID__c: SupportIDSF,
                    wfw_Donor_Source__c: donorSource,
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
            const donorSource = records[0].wfw_Donor_Source__c;
            // B. If a matching Contact has been found...
            console.log('Updating SF Contact with matching Legacy Supporter ID...');
            return upsertIf(dataValue('PrimKey'), 'Contact', 'wfw_Legacy_Supporter_ID__c', state => ({
              ...state.baseMapping(state.data, address, EmailSF),
              wfw_Donor_Source__c: donorSource,
            }))(state);
            // CHANGE REQUEST June 2023: Removed below logic to always update donor profile details with CG info
            // if (new Date(LastChangedDateTime) > new Date(LastModifiedDate)) {
            //   // If CG is more recent than SF
            //   return upsertIf(dataValue('PrimKey'), 'Contact', 'wfw_Legacy_Supporter_ID__c', state => ({
            //     ...state.baseMapping(state.data, address, EmailSF),
            //   }))(state);
            // } else {
            //   // upsertCondition = 3; // We update contact but only Committed_Giving_ID__c
            //   console.log('SF Contact is more recently updated than the CG contact. Skipping update.');
            //   return update(
            //     'Contact',
            //     fields(field('Id', Id), field('Committed_Giving_ID__c', dataValue('PrimKey')), field())
            //   )(state);
            // }
          }
        });
      } else {
        const { FirstName, LastModifiedDate, Id, Email } = records[0];
        const SupportIDSF = records[0].wfw_Legacy_Supporter_ID__c;
        const donorSource = records[0].wfw_Donor_Source__c;
        const PrimKey = records[0].Committed_Giving_ID__c;
        console.log('Existing SF Contact found for donor with PrimKey ', PrimKey);

        return upsertIf(dataValue('PrimKey'), 'Contact', 'Committed_Giving_ID__c', state => ({
          ...state.baseMapping(state.data, address, Email),
          wfw_Legacy_Supporter_ID__c: SupportIDSF,
          wfw_Donor_Source__c: donorSource,
        }))(state);

        //== CHANGE REQUEST June 2023 to now override SF Donor with CG profile. ====//
        //== Replaces logic below that used to see if CG data was more recent =====//
        // // CG Date is more recent than SF ?
        // if (new Date(LastChangedDateTime) > new Date(LastModifiedDate)) {
        //   //if (new Date() > new Date(LastModifiedDate)) { //if we want to compare today's date to SF date
        //   email = Email == null ? `${PrimKey}@incomplete.com` : undefined;
        //   // prettier-ignore
        //   return update(
        //     'Contact',
        //     fields(
        //       field('Id', Id),
        //       field('Committed_Giving_ID__c', PrimKey),
        //       field('npe01__HomeEmail__c', email)
        //     )
        //   )(state);
        // } else {
        //   // NO
        //   const { Surname } = state.data;
        //   console.log(`Skipping update. Salesforce Contact is more recent for ${PrimKey} - ${FirstName} ${Surname}`);
        //   return state;
        // }
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
