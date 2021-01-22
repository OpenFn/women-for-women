alterState(state => {
  const administrativeUnitsMap = {
    Afghanistan: 'a6ea8828-6a06-450e-84ea-126967bb5468',
    'Afghanistan - PM Access': 'a6ea8828-6a06-450e-84ea-126967bb5468',
    Headquarters: '61c87b53-b995-43ab-ba5a-1b9d62c893f3',
    'Headquarters - PM Access': '61c87b53-b995-43ab-ba5a-1b9d62c893f3',
    Iraq: '1f4492b8-32bf-4363-8a91-21eaecc6814e',
    'Iraq - PM Access': '1f4492b8-32bf-4363-8a91-21eaecc6814e',
    Nigeria: '194d1892-e2e7-4d0c-bcf4-b6902faff574',
    'Nigeria - PM Access': '194d1892-e2e7-4d0c-bcf4-b6902faff574',
    Rwanda: 'b4c8cf51-f8e2-413a-ad4f-f466a180956f',
    'Rwanda - PM Access': 'b4c8cf51-f8e2-413a-ad4f-f466a180956f',
    'South Sudan': '2367b7c5-3757-440e-9fcd-64f45b8821f8',
    'South Sudan - PM Access': '2367b7c5-3757-440e-9fcd-64f45b8821f8',
    'The Democratic Republic of the Congo': '487422cb-09bc-4607-87e1-9e817498d47e',
    'The Democratic Republic of the Congo - PM Access': '487422cb-09bc-4607-87e1-9e817498d47e',
    WOC: '8406e250-1202-4c15-815e-0b4ae118c548',
    'WOC - PM Access': '8406e250-1202-4c15-815e-0b4ae118c548',
    'No Division': '39d714aa-9abe-417f-a07a-c4ef698d87bd',
  };

  const groupMap = {
    'Full User (paid)': 'eb4a88b5-a02c-4ae9-abb8-cd9b082aae15',
    'Mobile User (free)': '4e19592a-345b-461b-9058-ff6e21164bbd',
  };

  const stateMap = {
    // Table for matching countries with ISO codes
    Afghanistan: 'AF',
    Albania: 'AL',
    Algeria: 'DZ',
    'American Samoa': 'AS',
    Andorra: 'AD',
    Angola: 'AO',
    Anguilla: 'AI',
    Antarctica: 'AQ',
    'Antigua and Barbuda': 'AG',
    Argentina: 'AR',
    Armenia: 'AM',
    Aruba: 'AW',
    Australia: 'AU',
    Austria: 'AT',
    Azerbaijan: 'AZ',
    Bahamas: 'BS',
    Bahrain: 'BH',
    Bangladesh: 'BD',
    Barbados: 'BB',
    Belarus: 'BY',
    Belgium: 'BE',
    Belize: 'BZ',
    Benin: 'BJ',
    Bermuda: 'BM',
    Bhutan: 'BT',
    'Bolivia, Plurinational State of': 'BO',
    'Bonaire, Sint Eustatius and Saba': 'BQ',
    'Bosnia and Herzegovina': 'BA',
    Botswana: 'BW',
    'Bouvet Island': 'BV',
    Brazil: 'BR',
    'British Indian Ocean Territory': 'IO',
    'Brunei Darussalam': 'BN',
    Bulgaria: 'BG',
    'Burkina Faso': 'BF',
    Burundi: 'BI',
    Cambodia: 'KH',
    Cameroon: 'CM',
    Canada: 'CA',
    'Cape Verde': 'CV',
    'Cayman Islands': 'KY',
    'Central African Republic': 'CF',
    Chad: 'TD',
    Chile: 'CL',
    China: 'CN',
    'Christmas Island': 'CX',
    'Cocos (Keeling) Islands': 'CC',
    Colombia: 'CO',
    Comoros: 'KM',
    Congo: 'CG',
    'Congo, the Democratic Republic of the': 'CD',
    'Cook Islands': 'CK',
    'Costa Rica': 'CR',
    'CÃ´te dIvoire': 'CI',
    Croatia: 'HR',
    Cuba: 'CU',
    'CuraÃ§ao': 'CW',
    Cyprus: 'CY',
    'Czech Republic': 'CZ',
    Denmark: 'DK',
    Djibouti: 'DJ',
    Dominica: 'DM',
    'Dominican Republic': 'DO',
    Ecuador: 'EC',
    Egypt: 'EG',
    'El Salvador': 'SV',
    'Equatorial Guinea': 'GQ',
    Eritrea: 'ER',
    Estonia: 'EE',
    Ethiopia: 'ET',
    'Falkland Islands (Malvinas)': 'FK',
    'Faroe Islands': 'FO',
    Fiji: 'FJ',
    Finland: 'FI',
    France: 'FR',
    'French Guiana': 'GF',
    'French Polynesia': 'PF',
    'French Southern Territories': 'TF',
    Gabon: 'GA',
    Gambia: 'GM',
    Georgia: 'GE',
    Germany: 'DE',
    Ghana: 'GH',
    Gibraltar: 'GI',
    Greece: 'GR',
    Greenland: 'GL',
    Grenada: 'GD',
    Guadeloupe: 'GP',
    Guam: 'GU',
    Guatemala: 'GT',
    Guernsey: 'GG',
    Guinea: 'GN',
    'Guinea-Bissau': 'GW',
    Guyana: 'GY',
    Haiti: 'HT',
    'Heard Island and McDonald Islands': 'HM',
    'Holy See (Vatican City State)': 'VA',
    Honduras: 'HN',
    'Hong Kong': 'HK',
    Hungary: 'HU',
    Iceland: 'IS',
    India: 'IN',
    Indonesia: 'ID',
    'Iran, Islamic Republic of': 'IR',
    Iraq: 'IQ',
    Ireland: 'IE',
    'Isle of Man': 'IM',
    Israel: 'IL',
    Italy: 'IT',
    Jamaica: 'JM',
    Japan: 'JP',
    Jersey: 'JE',
    Jordan: 'JO',
    Kazakhstan: 'KZ',
    Kenya: 'KE',
    Kiribati: 'KI',
    'South Korea': 'KP',
    North: 'KR',
    Kuwait: 'KW',
    Kyrgyzstan: 'KG',
    Laos: 'LA',
    Latvia: 'LV',
    Lebanon: 'LB',
    Lesotho: 'LS',
    Liberia: 'LR',
    Libya: 'LY',
    Liechtenstein: 'LI',
    Lithuania: 'LT',
    Luxembourg: 'LU',
    Macao: 'MO',
    'Macedonia, the Former Yugoslav Republic of': 'MK',
    Madagascar: 'MG',
    Malawi: 'MW',
    Malaysia: 'MY',
    Maldives: 'MV',
    Mali: 'ML',
    Malta: 'MT',
    'Marshall Islands': 'MH',
    Martinique: 'MQ',
    Mauritania: 'MR',
    Mauritius: 'MU',
    Mayotte: 'YT',
    Mexico: 'MX',
    'Micronesia, Federated States of': 'FM',
    'Moldova, Republic of': 'MD',
    Monaco: 'MC',
    Mongolia: 'MN',
    Montenegro: 'ME',
    Montserrat: 'MS',
    Morocco: 'MA',
    Mozambique: 'MZ',
    Myanmar: 'MM',
    Namibia: 'NA',
    Nauru: 'NR',
    Nepal: 'NP',
    Netherlands: 'NL',
    'New Caledonia': 'NC',
    'New Zealand': 'NZ',
    Nicaragua: 'NI',
    Niger: 'NE',
    Nigeria: 'NG',
    Niue: 'NU',
    'Norfolk Island': 'NF',
    'Northern Mariana Islands': 'MP',
    Norway: 'NO',
    Oman: 'OM',
    Pakistan: 'PK',
    Palau: 'PW',
    'Palestine, State of': 'PS',
    Panama: 'PA',
    'Papua New Guinea': 'PG',
    Paraguay: 'PY',
    Peru: 'PE',
    Philippines: 'PH',
    Pitcairn: 'PN',
    Poland: 'PL',
    Portugal: 'PT',
    'Puerto Rico': 'PR',
    Qatar: 'QA',
    'RÃ©union': 'RE',
    Romania: 'RO',
    'Russian Federation': 'RU',
    Rwanda: 'RW',
    'Saint BarthÃ©lemy': 'BL',
    'Saint Helena, Ascension and Tristan da Cunha': 'SH',
    'Saint Kitts and Nevis': 'KN',
    'Saint Lucia': 'LC',
    'Saint Martin (French part)': 'MF',
    'Saint Pierre and Miquelon': 'PM',
    'Saint Vincent and the Grenadines': 'VC',
    Samoa: 'WS',
    'San Marino': 'SM',
    'Sao Tome and Principe': 'ST',
    'Saudi Arabia': 'SA',
    Senegal: 'SN',
    Serbia: 'RS',
    Seychelles: 'SC',
    'Sierra Leone': 'SL',
    Singapore: 'SG',
    'Sint Maarten (Dutch part)': 'SX',
    Slovakia: 'SK',
    Slovenia: 'SI',
    'Solomon Islands': 'SB',
    Somalia: 'SO',
    'South Africa': 'ZA',
    'South Georgia and the South Sandwich Islands': 'GS',
    'South Sudan': 'SS',
    Spain: 'ES',
    'Sri Lanka': 'LK',
    Sudan: 'SD',
    Suriname: 'SR',
    'Svalbard and Jan Mayen': 'SJ',
    Swaziland: 'SZ',
    Sweden: 'SE',
    Switzerland: 'CH',
    'Syrian Arab Republic': 'SY',
    'Taiwan, Province of China': 'TW',
    Tajikistan: 'TJ',
    'Tanzania, United Republic of': 'TZ',
    Thailand: 'TH',
    'Timor-Leste': 'TL',
    Togo: 'TG',
    Tokelau: 'TK',
    Tonga: 'TO',
    'Trinidad and Tobago': 'TT',
    Tunisia: 'TN',
    Turkey: 'TR',
    Turkmenistan: 'TM',
    'Turks and Caicos Islands': 'TC',
    Tuvalu: 'TV',
    Uganda: 'UG',
    Ukraine: 'UA',
    'United Arab Emirates': 'AE',
    'United Kingdom': 'GB',
    'United States': 'US',
    'United States Minor Outlying Islands': 'UM',
    Uruguay: 'UY',
    Uzbekistan: 'UZ',
    Vanuatu: 'VU',
    'Venezuela, Bolivarian Republic of': 'VE',
    'Viet Nam': 'VN',
    'Virgin Islands, British': 'VG',
    'Virgin Islands, U.S.': 'VI',
    'Wallis and Futuna': 'WF',
    'Western Sahara': 'EH',
    Yemen: 'YE',
    Zambia: 'ZM',
    Zimbabwe: 'ZW',
  };

  const EmploymentStatus = [
    'Fellow',
    'Furloughed',
    'Intern',
    'Regular Full-Time',
    'Regular Part-Time',
    'Temporary Staff',
    'Terminated',
    'Terminated - Gros Mis-conduct',
    'Terminated - Resignation',
    'Terminated - RIF',
  ];

  const activeDivisions = [
    'Headquarters',
    'Headquarters - PM Access',
    'Afghanistan',
    'Afghanistan - PM Access',
    'Iraq',
    'Iraq - PM Access',
    'Kosovo',
    'Nigeria',
    'Nigeria - PM Access',
    'Rwanda',
    'South Sudan',
    'The Democratic Republic of the Congo',
    'WOC',
  ]; // Add divisions to turn "on"

  const errors = [];

  state.employees = state.data.employees;
  return { ...state, stateMap, EmploymentStatus, administrativeUnitsMap, groupMap, activeDivisions, errors };
});

// GET TOKEN
alterState(state => {
  // destructuring configuration elements
  const { host, userName, password, scope, client_secret, client_id, tenant_id, grant_type, api } = state.configuration;

  const data = {
    grant_type,
    client_id,
    client_secret,
    scope,
    userName,
    password,
  };

  let users = [];
  let nbPage = 1;
  // Recursively fetch users when spread accross multiple pages.
  function getAllUsers(access_token, nextLink) {
    const url = nextLink || `${api}/users?$select=employeeId,userPrincipalName,id,mail`;
    console.log('Fetching employees at page', nbPage);
    return new Promise((resolve, reject) => {
      // GET ALL USERS
      resolve(
        get(
          `${url}`, // We select employeeId, upn and mail
          {
            headers: {
              authorization: `Bearer ${access_token}`,
            },
            options: {
              successCodes: [200, 201, 202, 203, 204, 404],
            },
          },
          state => {
            const { value } = state.data;
            users.push(...value);
            if (state.data['@odata.nextLink']) {
              nbPage++;
              return Promise.resolve(getAllUsers(access_token, state.data['@odata.nextLink']));
            }
            return { ...state, users, access_token };
          }
        )(state)
      );
    });
  }

  return post(
    `${host}${tenant_id}/oauth2/v2.0/token`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      form: data,
    },
    state => {
      console.log('Authentication successful');
      state.access_token = state.data.access_token;
      return Promise.resolve(getAllUsers(state.access_token));
    }
  )(state);
});

//FOR EVERY NEW EMPLOYEE SENT VIA BAMBOO...
each(
  '$.employees[*]',

  alterState(state => {
    function removeExtraSpace(object) {
      for (var obj in object) {
        if (object[obj]) object[obj] = object[obj].replace(/\s{2,}/g, ' ');
      }
    }
    const { api } = state.configuration;
    const employee = state.data; // We get the current employee
    const { fields } = employee;
    const userEmployeeIds = state.users.map(val => val.employeeId); // We get users ids

    if (!fields.Division || fields.Division === '') fields.Division = 'No Division';

    removeExtraSpace(fields);

    function assignManager() {
      return new Promise((resolve, reject) => {
        // 1.2 ASSIGN USER TO MANAGER
        const supervisorEmail = employee.fields['Supervisor email'];
        if (supervisorEmail) {
          const userPrincipalName = supervisorEmail.replace('@', '_') + '%23EXT%23@w4wtest.onmicrosoft.com'; // Replace # with %23
          // We (1) make a get to fetch the supervisor id.
          return get(
            `${api}/users/${userPrincipalName}`,
            {
              headers: {
                authorization: `Bearer ${state.access_token}`,
              },
              options: {
                successCodes: [200, 201, 202, 203, 204, 404],
              },
            },
            state => {
              if (!state.data.error) {
                // (2) if we find it,
                const { id } = state.data;
                const data = {
                  '@odata.id': `${api}/users/${id}`,
                };
                console.log(
                  `Assigning ${fields['First name Last name']} (${fields['Employee #']}) to manager ${supervisorEmail} ...`
                );
                resolve(
                  put(`${api}/users/${employee.id}/manager/$ref`, {
                    headers: {
                      authorization: `Bearer ${state.access_token}`,
                      'Content-Type': 'application/json',
                    },
                    options: {
                      successCodes: [200, 201, 202, 203, 204, 404],
                    },
                    body: data,
                  })(state)
                );
              } else {
                console.log(`Manager ${supervisorEmail} not found...`);
                resolve(state);
              }
            }
          )(state);
        }
        resolve(state);
      });
    }

    function assignAU() {
      return new Promise((resolve, reject) => {
        // 1.3 ADD USER AS MEMBER TO ADMINISTRATIVE UNIT
        const idsValue = Object.values(state.administrativeUnitsMap);
        const administrativeUnitID = state.administrativeUnitsMap[employee.fields.Division]; // Mapping AU name to correct ID
        if (administrativeUnitID) {
          // (a) First we make a request to see if the employee has membership to any administrative unit...
          return post(
            `${api}/users/${employee.id}/checkMemberObjects`,
            {
              headers: {
                authorization: `Bearer ${state.access_token}`,
                'Content-Type': 'application/json',
              },
              options: {
                successCodes: [200, 201, 202, 203, 204, 404],
              },
              body: { ids: idsValue },
            },
            state => {
              console.log('state', state.data);
              const { value } = state.data.body;
              // ... (b1) if he has, we remove him from the administrative unit...

              if (value && value.length > 0) {
                console.log(`Removing member from the administrative unit ${value[0]}...`);
                return del(
                  `${api}/directory/administrativeUnits/${value[0]}/members/${employee.id}/$ref`,
                  {
                    headers: {
                      authorization: `Bearer ${state.access_token}`,
                      'Content-Type': 'application/json',
                    },
                    options: {
                      successCodes: [200, 201, 202, 203, 204, 404],
                    },
                  },
                  state => {
                    // ... (c) We add him to the new administrative unit.
                    console.log(`Adding member to the administrative units ${employee.fields.Division}...`);
                    const data = {
                      '@odata.id': `${api}/directoryObjects/${employee.id}`,
                    };
                    resolve(
                      post(`${api}/directory/administrativeUnits/${administrativeUnitID}/members/$ref`, {
                        headers: {
                          authorization: `Bearer ${state.access_token}`,
                          'Content-Type': 'application/json',
                        },
                        options: {
                          successCodes: [200, 201, 202, 203, 204, 404],
                        },
                        body: data,
                      })(state)
                    );
                    return state;
                  }
                )(state); /* .then(response => {
                }); */
              } else {
                // ... (b2) if he has not, we add him still.
                console.log(`Adding member to the administrative units ${employee.fields.Division}...`);
                const data = {
                  '@odata.id': `${api}/directoryObjects/${employee.id}`,
                };
                resolve(
                  post(`${api}/directory/administrativeUnits/${administrativeUnitID}/members/$ref`, {
                    headers: {
                      authorization: `Bearer ${state.access_token}`,
                      'Content-Type': 'application/json',
                    },
                    options: {
                      successCodes: [200, 201, 202, 203, 204, 404],
                    },
                    body: data,
                  })(state)
                );
              }
            }
          )(state);
        }
        resolve(state);
      });
    }

    function assignGroup() {
      return new Promise((resolve, reject) => {
        // 1.4 ADD USER AS MEMBER TO GROUP.
        const groupIdsValue = Object.values(state.groupMap);
        const groupID = state.groupMap[employee.fields['Email User Type']]; // Mapping group name to correct ID
        if (groupID) {
          // (a) First we make a request to see if the employee has membership to any group...
          return post(
            `${api}/users/${employee.id}/checkMemberObjects`,
            {
              headers: {
                authorization: `Bearer ${state.access_token}`,
                'Content-Type': 'application/json',
              },
              options: {
                successCodes: [200, 201, 202, 203, 204, 404],
              },
              body: { ids: groupIdsValue },
            },
            state => {
              const { value } = state.data.body;
              // ... (b1) if he has, we remove him from the group...
              if (value && value.length > 0) {
                console.log(`Removing member from the group ${value[0]}...`);
                return del(
                  `${api}/groups/${value[0]}/members/${employee.id}/$ref`,
                  {
                    headers: {
                      authorization: `Bearer ${state.access_token}`,
                      'Content-Type': 'application/json',
                    },
                    options: {
                      successCodes: [200, 201, 202, 203, 204, 404],
                    },
                  },
                  state => {
                    // ... (c) We add him to the new group.
                    console.log(`Adding member to the new group ${employee.fields['Email User Type']}...`);
                    const data = {
                      '@odata.id': `${api}/directoryObjects/${employee.id}`,
                    };
                    resolve(
                      post(`${api}/groups/${groupID}/members/$ref`, {
                        headers: {
                          authorization: `Bearer ${state.access_token}`,
                          'Content-Type': 'application/json',
                        },
                        options: {
                          successCodes: [200, 201, 202, 203, 204, 404],
                        },
                        body: data,
                      })(state)
                    );
                    return state;
                  }
                )(state); /* .then(response => {}); */
              } else {
                // ... (b2) if he has not, we add him still.
                console.log(`Adding member to the group ${employee.fields['Email User Type']}...`);
                const data = {
                  '@odata.id': `${api}/directoryObjects/${employee.id}`,
                };
                resolve(
                  post(`${api}/groups/${groupID}/members/$ref`, {
                    headers: {
                      authorization: `Bearer ${state.access_token}`,
                      'Content-Type': 'application/json',
                    },
                    options: {
                      successCodes: [200, 201, 202, 203, 204, 404],
                    },
                    body: data,
                  })(state)
                );
              }
            }
          )(state);
        }
        resolve(state);
      });
    }

    if (state.activeDivisions.includes(employee.fields.Division)) {
      if (!employee.fields['Work Email']) {
        state.errors.push(
          `No Azure actions taken because 'Work Email' not provided for ${fields['First name Last name']}.`
        );
        return state;
      } else {
        if (employee.fields['Email User Type'] === 'Does not need email account') {
          console.log(`No Azure actions taken because employee 'does not need email account' - see Email User Type.`);
        }

        const work_email = employee.fields['Work Email'];
        const userPrincipalName = work_email.replace('@', '_') + '#EXT#@w4wtest.onmicrosoft.com';

        // We get the upn of that user we matched ... and it's azure id
        const azureEmployee = state.users.find(
          val =>
            val.employeeId === fields['Employee #'] ||
            val.userPrincipalName.toLowerCase() === userPrincipalName.toLowerCase()
        );

        console.log('Matched employee...', JSON.stringify(azureEmployee, null, 2));

        // We check if the current 'Employee Id' exists in Azure
        if (
          userEmployeeIds.includes(fields['Employee #']) ||
          (azureEmployee && azureEmployee.userPrincipalName.toLowerCase() === userPrincipalName.toLowerCase())
        ) {
          // If the user from azure has the same upn than the one from bambooHR
          if (azureEmployee && azureEmployee.mail && azureEmployee.mail.toLowerCase() === work_email.toLowerCase()) {
            const termination_date = fields['Termination Date'];
            if (
              //employee.changedFields.includes('Status') && //We want to upsert even if Status not changed
              fields.Status === 'Active' &&
              state.EmploymentStatus.includes(fields['Employment Status']) &&
              (new Date(termination_date) > new Date() || !termination_date)
            ) {
              // STEP 2.a: User found, we are updating...
              console.log(`Updating ${fields['First name Last name']} (${fields['Employee #']}) user information...`);

              const displayName = [
                fields['Preferred Name'] || fields['First Name'],
                fields['Middle initial'],
                fields['Last Name'],
              ]
                .filter(Boolean)
                .join(' ');

              const data = {
                accountEnabled: fields.Status === 'Active' ? true : false,
                employeeType: fields['Employment Status'],
                userType: 'Member',
                mailNickname:
                  fields['First Name'].substring(0, 1) +
                  (fields['Middle initial'] ? fields['Middle initial'] : '') +
                  fields['Last Name'].replace(
                    ' ',
                    ''
                  ) /*+
                '@womenforwomen.org', //Confirm transforms to AGKrolls@womenforwomen.org */,
                userPrincipalName: work_email.replace('@', '_') + '#EXT#@w4wtest.onmicrosoft.com',
                // givenName: fields['First name Last name'] + fields['Middle initial'] + fields['Last Name'],
                mail: fields['Work Email'],
                birthday: fields.Birthday,
                department: fields.Department,
                officeLocation: fields.Division,
                employeeId: fields['Employee #'],
                displayName,
                //hireDate: new Date(fields['Hire Date']).toISOString(), // ---Request not supported? needs to be in datetime ISO format "2014-01-01T00:00:00Z", then will it work?
                otherMails: fields['Home Email'] ? [fields['Home Email']] : undefined, // ---Request not supported? needs to be in array ['email1', 'email2']; do not map, never return empty []
                jobTitle: fields['Job Title'],
                surname: fields['Last Name'],
                usageLocation: state.stateMap[fields.Location],
                //middleName: fields['Middle Name'], // --------Request not supported? Property invalid error--------
                mobilePhone: fields['Mobile Phone'],
                businessPhones: fields['Work Phone'] ? [fields['Work Phone']] : undefined, // don't map if blank; do not return empty array`[]` or will hit error
                //preferredName: fields['Preferred Name'], // ---------Request not supported?---------
                givenName: fields['First Name'],
                companyName: 'Women for Women International',
                //profilePhoto  //PHASE 2--> Unable to transfer photos in this v1
              };
              if (data.otherMails === null) delete data.otherMails;
              console.log(data);

              const { id } = state.data; // Employee ID
              console.log(azureEmployee.id);
              return patch(
                `${api}/users/${azureEmployee.id}`,
                {
                  headers: {
                    authorization: `Bearer ${state.access_token}`,
                    'Content-Type': 'application/json',
                  },
                  options: {
                    successCodes: [200, 201, 202, 203, 204, 404],
                  },
                  body: data,
                },
                state => {
                  employee.id = azureEmployee.id;
                  return state;
                }
              )(state).then(response => {
                // 2.2 ASSIGN USER TO MANAGER
                // 2.3 ADD USER AS MEMBER TO ADMINISTRATIVE UNIT
                // assignAU();
                // 2.4 ADD USER AS MEMBER TO GROUP.
                // assignGroup();
                // return state;
                return Promise.all([assignManager(), assignAU(), assignGroup()]).then(() => state);
              });
            } else {
              console.log(
                `No Azure changes made. Employment Status does not qualify for integration.
              Nothing to update for ${fields['First name Last name']} (${fields['Employee #']}) at this time`
              );
              return state;
            }
          } else {
            state.errors
              .push(`${fields['First name Last name']} User Principal Name (${userPrincipalName}) and Bamboo Work Email
              (${azureEmployee.userPrincipalName}) do not match. Please review this user to confirm the Work Email entered in BambooHR.
              Please review this employee ${fields['Employee #']} to confirm the email and UPN are correct.`);
            return state;
          }
        } else {
          if (azureEmployee && azureEmployee.mail && azureEmployee.mail.toLowerCase() === work_email.toLowerCase()) {
            state.errors
              .push(`${fields['First name Last name']} User Principal Name (${userPrincipalName}) and Bamboo Work Email
              (${azureEmployee.userPrincipalName}) do not match. Please review this user to confirm the Work Email entered in BambooHR.
              Please review this employee ${fields['Employee #']} to confirm the email and UPN are correct.`);
            return state;
          } else {
            const termination_date = fields['Termination Date'];
            // Creating new Azure user
            if (
              //employee.changedFields.includes('Status') && //We want to upsert even if Status not changed
              fields.Status === 'Active' &&
              state.EmploymentStatus.includes(fields['Employment Status']) &&
              (new Date(termination_date) > new Date() || !termination_date)
            ) {
              const { fields } = employee;
              const work_email = employee.fields['Work Email'];
              // STEP 2.b: User was not found, we are creating a new user.
              console.log(`Creating a new user for ${fields['First name Last name']}...`);

              const displayName = [
                fields['Preferred Name'] || fields['First Name'],
                fields['Middle initial'],
                fields['Last Name'],
              ]
                .filter(Boolean)
                .join(' ');

              const data = {
                accountEnabled: fields.Status === 'Active' ? true : false,
                employeeType: fields['Employment Status'], // Confirm with Aleksa/Jed
                userType: 'Member',
                passwordProfile: {
                  forceChangePasswordNextSignIn: true,
                  forceChangePasswordNextSignInWithMfa: false,
                  password: "You'll Never Walk Alone!",
                },
                mailNickname:
                  fields['First Name'].substring(0, 1) +
                  (fields['Middle initial'] ? fields['Middle initial'] : '') +
                  fields['Last Name'].replace(' ', ''), //Confirm transforms to AGKrolls@womenforwomen.org
                userPrincipalName: work_email.replace('@', '_') + '#EXT#@w4wtest.onmicrosoft.com',
                // givenName: fields['First name Last name'] + fields['Middle initial'] + fields['Last Name'],
                mail: fields['Work Email'],
                birthday: fields.Birthday,
                department: fields.Department,
                officeLocation: fields.Division,
                employeeId: fields['Employee #'],
                displayName,
                //hireDate: new Date(fields['Hire Date']).toISOString(), // ---Request not supported? needs to be in datetime ISO format "2014-01-01T00:00:00Z", then will it work?
                otherMails: fields['Home Email'] ? [fields['Home Email']] : null, // ---Request not supported? needs to be in array ['email1', 'email2']; do not map, never return empty []
                jobTitle: fields['Job Title'],
                surname: fields['Last Name'],
                usageLocation: state.stateMap[fields.Location],
                //middleName: fields['Middle Name'], // --------Request not supported? Property invalid error--------
                mobilePhone: fields['Mobile Phone'],
                businessPhones: fields['Work Phone'] ? [fields['Work Phone']] : undefined, // don't map if blank; do not return empty array`[]` or will hit error
                //preferredName: fields['Preferred Name'], // ---------Request not supported?---------
                givenName: fields['First Name'],
                companyName: 'Women for Women International',
                //profilePhoto  //PHASE 2--> Unable to transfer photos in this v1
              };

              if (data.otherMails === null) delete data.otherMails;
              console.log(data);
              return post(
                `${api}/users`,
                {
                  headers: {
                    authorization: `Bearer ${state.access_token}`,
                    'Content-Type': 'application/json',
                  },
                  options: {
                    successCodes: [200, 201, 202, 203, 204, 404],
                  },
                  body: data,
                },
                state => {
                  const { id } = state.data.body;
                  employee.id = id;
                  // 2.2 ASSIGN USER TO MANAGER
                  // assignManager();
                  // // 2.3 ADD USER AS MEMBER TO ADMINISTRATIVE UNIT
                  // assignAU();
                  // // 2.4 ADD USER AS MEMBER TO GROUP.
                  // assignGroup();
                  // console.log(`Azure user updates: ${state.data}`);
                  return Promise.all([assignManager(), assignAU(), assignGroup()]).then(() => state);
                  // return Promise.resolve(assignManager())
                  //   .then(Promise.resolve(assignAU()))
                  //   .then(Promise.resolve(assignGroup()))
                  //   .then(() => state);
                }
              )(state);
            } else {
              console.log(
                `No Azure changes made. Employment Status does not qualify for integration.
            Nothing to update for ${fields['First name Last name']} (${fields['Employee #']}) at this time`
              );
              return state;
            }
          }
        }
      }
    } else {
      console.log('Employee not member of activated Division. No automation executed.');
      return state;
    }
  })
);

alterState(state => {
  if (state.errors.length > 0) {
    console.log(JSON.stringify(state.errors, null, 2));
    throw new Error('Some errors detected during run.');
  }
  return state;
});
