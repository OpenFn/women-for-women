fn(state => {
  const { json } = state.data;
  const newJson = [];

  function reduceArray(array, groupBy) {
    return array.reduce((r, a) => {
      r[a[groupBy]] = r[a[groupBy]] || [];
      r[a[groupBy]].push(a);

      return r;
    }, Object.create(null));
  }

  const group = reduceArray(json, 'DDID');
  for (let obj in group) {
    const newObj = {};
    group[obj].forEach(ob => {
      if (ob.FieldName) newObj[ob.FieldName] = ob.Value;
    });
    newObj['DDID'] = obj;
    newJson.push(newObj);
  }

  const DDIDs = newJson.map(x => x.DDIS);

  return { ...state, data: { ...state.data, json: newJson }, DDIDs };
});

fn(state => {
  const queryAndUpdate = (DDID, contactId, state) => {
    // Check if contactID is empty or no
    state.data.contactID = contactId === '' ? [] : [field('npsp__Honoree_Contact__c', contactId)];

    return query(
      `Select Id, CloseDate FROM Opportunity 
      WHERE npe03__Recurring_Donation__r.Committed_Giving_Direct_Debit_ID__c = '${DDID}'
      ORDER BY CloseDate ASC LIMIT 1`
    )(state).then(state => {
      const { records } = state.references[0];
      if (records.length === 0) {
        throw new Error(
          'Matching Opportunity not found for this transaction. Please confirm that related Transaction data has been synced to Salesforce before re-running'
        );
      } else {
        return update('Opportunity', state => ({
          ...fields(
            field('Id', records[0].Id),
            field('npsp__Tribute_Type__c', state => {
              var tribute = dataValue('FormName')(state);
              return tribute ? tribute : 'Honor';
            }),
            field('npsp__Honoree_Name__c', dataValue('Honouree / Tributee Name')),
            field('Tribute_Occasion_Text__c', dataValue('Occasion')),
            field('Paper_Card_Shipping_City__c', dataValue('Notify Town')),
            field('Paper_Card_Shipping_Zip_Postal__c', dataValue('Notify Postcode')),
            field('Paper_Card_Shipping_State_Province__c', dataValue('Notify County')),
            field('Paper_Card_Shipping_Country__c', dataValue('Notify Country')),
            field('Paper_Card_Shipping_Name__c', dataValue('Notify First Name')),
            field('Paper_Card_Shipping_Address__c', dataValue('Notify Add1')),
            field('Paper_Card_Shipping_Address_Line_2__c', dataValue('Notify Add2')),
            field('eCard_Recipient_Email__c', dataValue('Notify Email Address'))
            //NOTE: These are the original mappings, but the above match CC and page layout... which ones to use?
            // field('wfw_Honoree_City__c', dataValue('Notify Town')),
            // field('wfw_Honoree_Zip__c', dataValue('Notify Postcode')),
            // field('wfw_Honoree_State__c', dataValue('Notify County')),
            // field('wfw_Honoree_Country__c', dataValue('Notify Country')),
            // field('npsp__Honoree_Contact__c', dataValue('Notify Name')),
            // field('Tribute_Occasion_Text__c', dataValue('Occasion')),
            // field('wfw_Honoree_Address_1__c', dataValue('Notify Add1')),
            // field('Honoree_Address_2__c', dataValue('Notify Add2')),
          ),
          ...fields(...state.data.contactID),
        }))(state);
      }
    });
  };

  return { ...state, queryAndUpdate };
});

each(
  '$.data.json[*]',
  fn(state => {
    const { DDID } = state.data;
    if (!state.data['Notify Email Address']) {
      console.log("'Notify Name' and 'Notify Email Address' are unavailable.");
      return state.queryAndUpdate(DDID, '', state); // @Aleksa: if no notify name and email should we update with empty contactId?
    } else {
      return query(
        state => `Select Id FROM Contact 
        WHERE email = '${state.data['Notify Email Address']}'`
        // WHERE Name = '${state.data['Notify First Name']}'`
        // WHERE email = '${state.data['Notify Email Address']}' OR Name = '${state.data['Notify First Name']}'`
      )(state).then(state => {
        const { records } = state.references[0];
        if (records.length === 0) {
          return upsert('Contact', 'Email', {
            FirstName: state.data['Notify First Name'].split(' ')[0],
            LastName: state.data['Notify Last Name'] || state.data['Notify First Name'].split(' ')[0],
            //Email: `${state.data['Notify Last Name']}@incomplete.com`,
            Email: state.data['Notify Email Address'] || `${state.data['Notify Name'].split(' ')[0]}@incomplete.com`,
          })(state).then(state => {
            const contactID = state.references[0].id;
            console.log('Updating recurring donation for contact', contactID);
            return upsert('npe03__Recurring_Donation__c', 'Committed_Giving_ID__c', {
              Committed_Giving_ID__c: DDID,
              Sponsor__c: contactID,
            })(state).then(state => {
              console.log('Contact ID to add', contactID);
              return state.queryAndUpdate(DDID, contactID, state);
            });
          });
        } else {
          const contactID = records.map(rec => rec.Id);
          console.log('Updating recurring donation for contact', contactID);
          return upsert('npe03__Recurring_Donation__c', 'Committed_Giving_ID__c', {
            Committed_Giving_ID__c: DDID,
            Sponsor__c: contactID,
          })(state).then(state => {
            console.log('Contact ID to add', contactID);
            return state.queryAndUpdate(DDID, contactID[0], state);
          });
        }
      });
    }
  })
);

fn(state => {
  // Throw error
  if (state.errors.length > 0) {
    console.log('Some errors occured');
    throw new Error(JSON.stringify(state.errors, null, 2));
  }
  return state;
});
