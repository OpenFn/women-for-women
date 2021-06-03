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
      field('Email', dataValue('EmailAddress')),
      field('npe01__Preferred_Email__c', dataValue('EmailAddress'))
    )
  )
);
