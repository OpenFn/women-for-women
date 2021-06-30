bulk(
  'Contact', // the sObject
  'upsert', //  the operation
  {
    extIdField: 'wfw_Legacy_Supporter_ID__c', // the field to match on
    failOnError: true, // throw error if just ONE record fails
    allowNoOp: true, // what is this?
  },
  state => {
    return state.data.json
      .filter(x => x.PersonRef)
      .map(x => {
        const email = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(x.EmailAddress) ? x.EmailAddress : null;
        const address = `${x.Address1} ${x.Address2} ${x.Address3} ${x.Address4}`;

        return {
          Committed_Giving_ID__c: x.PrimKey,
          wfw_Legacy_Supporter_ID__c: x.PersonRef,
          Salutation: x.Title,
          FirstName: x.FirstName,
          LastName: x.Surname,
          MailingStreet: address,
          MailingCity: x.Address5,
          MailingState: x.Address6,
          MailingPostalCode: x.Postcode,
          Email: email,
          npe01__Preferred_Email__c: email,
        };
      });
  }
);
