fn(state => {
  const { json } = state.data;
  state.errors = [];
  const newJson = [];

  function reduceArray(array, groupBy) {
    return array.reduce((r, a) => {
      r[a[groupBy]] = r[a[groupBy]] || [];
      r[a[groupBy]].push(a);

      return r;
    }, Object.create(null));
  }

  const group = reduceArray(json, 'CCID');

  for (let obj in group) {
    const newObj = {};
    group[obj].forEach(ob => {
      if (ob.FieldName) newObj[ob.FieldName] = ob.Value;
    });
    newObj['CCID'] = obj;
    newJson.push(newObj);
  }

  const CCIDs = newJson.map(x => x.CCID);

  return { ...state, data: { ...state.data, json: newJson }, CCIDs };
});

fn(state => {
  const queryAndUpdate = (CCID, contactId, state) => {
    // Check if contactID is empty or no
    state.data.contactID = contactId === '' ? [] : [field('npsp__Honoree_Contact__c', contactId)];

    return query(
      `Select Id, CloseDate FROM Opportunity
      WHERE CG_Credit_Card_Master_ID__c = '${CCID}'
      ORDER BY CloseDate ASC LIMIT 1`
    )(state).then(state => {
      const { records } = state.references[0];
      if (records.length === 0) {
        state.errors.push(
          `Matching Opportunity not found for this transaction (${CCID}). Please confirm that related Transaction data has been synced to Salesforce before re-running`
        );
        return state;
      } else {
        return update('Opportunity', state => ({
          ...fields(
            field('Id', records[0].Id),
            field('npsp__Tribute_Type__c', state => {
              var tribute = state.data['FormName'];
              return tribute ? tribute : 'Honor';
            }),
            field('Tribute_Occasion_Text__c', state.data['Occasion']),
            field('npsp__Honoree_Name__c', state.data['Honouree / Tributee Name']),
            field(
              'Paper_Card_Shipping_Name__c',
              state.data['Notify First  Name'] || state.data['Recipient First Name']
            ),
            field('Paper_Card_Shipping_Address__c', state.data['Notify Add1'] || state.data['Recipient Add1']),
            field('Paper_Card_Shipping_Address_Line_2__c', state.data['Notify Add2'] || state.data['Recipient Add2']),
            field('Paper_Card_Shipping_City__c', state.data['Notify Town'] || state.data['Recipient Town']),
            field(
              'Paper_Card_Shipping_Zip_Postal__c',
              state.data['Notify Postcode'] || state.data['Recipient Postcode']
            ),
            field('Paper_Card_Shipping_State_Province__c', state.data['Notify County'] || state.data['Recipient Add3']),
            field('Paper_Card_Shipping_Country__c', state.data['Notify Country'] || state.data['Recipient Country']),
            field('eCard_Recipient_Email__c', state.data['Notify Email Address'] || state.data['Recipient Email'])
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
    const { CCID } = state.data;
    if (!state.data['Recipient First Name'] || !state.data['Recipient Email']) {
      console.log("'Recipient First Name' or 'Recipient Email' are unavailable.");
      return state.queryAndUpdate(CCID, '', state); // @Aleksa: if no notify name and email should we update with empty contactId?
    } else {
      return query(
        state => `Select Id FROM Contact 
      WHERE email = '${state.data['Recipient Email']}' OR Name = '${state.data['Recipient First Name']}'`
      )(state).then(state => {
        const { records } = state.references[0];
        if (records.length === 0 && state.data['Recipient First Name']) {
          return upsert('Contact', 'Email', {
            FirstName: state.data['Recipient First Name'].split(' ')[0],
            LastName: state.data['Recipient First Name'].split(' ')[1] || state.data['Recipient Last Name'],
            Email:
              state.data['Recipient Email'] || `${state.data['Recipient First Name'].split(' ')[0]}@incomplete.com`,
          })(state).then(state => {
            const contactID = state.references[0].id;
            console.log('Updating recurring donation for contact', contactID);
            return upsert('npe03__Recurring_Donation__c', 'Committed_Giving_ID__c', {
              Committed_Giving_ID__c: CCID,
              Sponsor__c: contactID,
            })(state).then(state => {
              console.log('Contact ID to add', contactID);
              return state.queryAndUpdate(CCID, contactID, state);
            });
          });
        } else {
          const contactID = records.map(rec => rec.Id);
          console.log('Updating recurring donation for contact', contactID);
          return upsert('npe03__Recurring_Donation__c', 'Committed_Giving_ID__c', {
            Committed_Giving_ID__c: CCID,
            Sponsor__c: contactID,
          })(state).then(state => {
            console.log('Contact ID to add', contactID);
            return state.queryAndUpdate(CCID, contactID[0], state);
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
