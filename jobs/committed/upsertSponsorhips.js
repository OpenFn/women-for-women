beta.each(
  dataPath('json[*]'),
  upsert(
    'Contact',
    'wfw_Legacy_Supporter_ID__c',
    fields(
      field('Committed_Giving_ID__c', dataValue('PrimKey')),
      field('wfw_Legacy_Supporter_ID__c', dataValue('PersonRef')),
      field('Salutation', dataValue('Title')),
      field('FirstName', dataValue('FirstName')),
      field('LastName', dataValue('Surname')),
      field('MailingStreet', state => {
        const address = `${dataValue('Address1')(state)} ${dataValue('Address2')(state)} ${dataValue('Address3')(
          state
        )} ${dataValue('Address4')(state)}`;
        return address;
      }),
      field('MailingCity', dataValue('Address5')),
      field('MailingState', dataValue('Address6')),
      field('MailingPostalCode', dataValue('Postcode')),
      field('Email', state => {
        const email = dataValue('EmailAddress')(state);
        if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) return email;
        return null;
      }),
      field('npe01__Preferred_Email__c', state => {
        const email = dataValue('EmailAddress')(state);
        if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) return email;
        return null;
      })
    )
  )
);
