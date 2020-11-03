//**Sample job to creating users in AzureAD when new BambooHR employees registered**//
alterState(state => {
  const administrativeUnitsMap = {
    Afghanistan: 'a6ea8828-6a06-450e-84ea-126967bb5468',
    Headquarters: '61c87b53-b995-43ab-ba5a-1b9d62c893f3',
    Iraq: '1f4492b8-32bf-4363-8a91-21eaecc6814e',
    Nigeria: '194d1892-e2e7-4d0c-bcf4-b6902faff574',
    Rwanda: 'b4c8cf51-f8e2-413a-ad4f-f466a180956f',
    'South Sudan': '2367b7c5-3757-440e-9fcd-64f45b8821f8',
    'The Democratic Republic of the Congo': '487422cb-09bc-4607-87e1-9e817498d47e',
    WOC: '8406e250-1202-4c15-815e-0b4ae118c548',
  };

  const groupMap = {
    'Full User': 'eb4a88b5-a02c-4ae9-abb8-cd9b082aae15',
    'Mobile Only': '4e19592a-345b-461b-9058-ff6e21164bbd',
  };

  const stateMap = {
    //Table for matching countries with ISO codes
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
  ];

  state.employees = state.data.employees;
  return { ...state, stateMap, EmploymentStatus, administrativeUnitsMap, groupMap };
});

// GET TOKEN
alterState(state => {
  const { host, userName, password, scope, client_secret, client_id, tenant_id, grant_type } = state.configuration;

  const data = {
    grant_type,
    client_id,
    client_secret,
    scope,
    userName,
    password,
  };

  return post(
    `${host}${tenant_id}/oauth2/v2.0/token`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      form: data,
    },
    state => {
      console.log('Authentication done...');
      return { ...state, access_token: state.data.access_token };
    }
  )(state);
});

//FOR EVERY NEW EMPLOYEE SENT VIA BAMBOO...
each(
  '$.employees[*]',

  // STEP 1: Get User
  alterState(state => {
    const { api } = state.configuration;
    const employee = state.data; // We get the current employee
    const { fields } = employee;
    if (
      employee.changedFields.includes('Status') &&
      fields.Status === 'Active' &&
      state.EmploymentStatus.includes(fields['Employment Status'])
    ) {
      const work_email = employee.fields['Work Email'];
      const userPrincipalName = work_email.replace('@', '_') + '%23EXT%23@w4wtest.onmicrosoft.com'; // Replace # with %23
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
            // STEP 2.a: User found, we are updating...
            console.log('Updating user information...');
            const { fields } = employee;

            const data = {
              accountEnabled: fields.Status === 'Active' ? true : false,
              employeeType: fields['Employment Status'], // Confirm with Aleksa/Jed
              userType: 'Member',
              /* passwordProfile: { // ---------Insufficient privileges---------
              forceChangePasswordNextSignIn: true,
              forceChangePasswordNextSignInWithMfa: false,
              password: 'opWWK6$8b&', //Q: choose default password?
            }, */
              /*    mailNickname:
              fields['First Name'].substring(0, 1) +
              fields['Middle initial'] +
              fields['Last Name'] +
              '@womenforwomen.org', //TODO: Transform to AGKrolls@womenforwomen.org */
              userPrincipalName: work_email.replace('@', '_') + '#EXT#@w4wtest.onmicrosoft.com',
              givenName: fields['First name Last name'] + fields['Middle initial'] + fields['Last Name'],
              mail: fields['Work email'],
              birthday: fields.Birthday,
              department: fields.Department,
              officeLocation: fields.Division,
              employeeId: fields['Employee #'],
              displayName: fields['First name Last name'],
              //hireDate: fields['Hire Date'], // ---------Request not supported---------
              //otherMails: fields['Home Email'], // ---------Problem with JSON reader---------
              jobTitle: fields['Job Title'],
              surname: fields['Last Name'],
              usageLocation: state.stateMap[fields.Location], //TODO: Compare countries with Bamboo list
              //middleName: fields['Middle Name'], // ---------Property invalid---------
              //mobilePhone: fields['Mobile Phone'], // ---------Insufficient privileges---------
              //businessPhones: [fields['Work Phone']], // ---------Insufficient privileges---------
              //preferredName: fields['Preferred Name'], // ---------Request not supported---------
              givenName: fields['First Name'],
              //profilePhoto  //TODO: DISCUSS step with Engineers
              //supervisorID  //TODO: CONFIRM if we can link to directoryObject with supervisor Email
            };
            const { id } = state.data; // Employee ID
            return patch(
              `${api}/users/${id}`,
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
                employee.id = id;
                return state;
              }
            )(state);
          } else {
            // STEP 2.b: User was not found, we are creating a new user.
            console.log('Creating a new user...');
            const { fields } = employee;
            const data = {
              accountEnabled: fields.Status === 'Active' ? true : false,
              employeeType: fields['Employment Status'], // Confirm with Aleksa/Jed
              userType: 'Member',
              passwordProfile: {
                forceChangePasswordNextSignIn: true,
                forceChangePasswordNextSignInWithMfa: false,
                password: 'opWWK6$8b&', //Q: choose default password?
              },
              mailNickname: fields['First Name'].substring(0, 1) + fields['Middle initial'] + fields['Last Name'], //TODO: Transform to AGKrolls@womenforwomen.org
              userPrincipalName: work_email.replace('@', '_') + '#EXT#@w4wtest.onmicrosoft.com',
              givenName: fields['First name Last name'] + fields['Middle initial'] + fields['Last Name'],
              mail: fields['Work email'],
              birthday: fields.Birthday,
              department: fields.Department,
              officeLocation: fields.Division,
              employeeId: fields['Employee #'],
              displayName: fields['First name Last name'],
              //hireDate: fields['Hire Date'], // ---------Request not supported---------
              //otherMails: fields['Home Email'], // ---------Problem with JSON reader---------
              jobTitle: fields['Job Title'],
              surname: fields['Last Name'],
              usageLocation: state.stateMap[fields.Location], //TODO: Compare countries with Bamboo list
              //middleName: fields['Middle Name'], // ---------Property invalid---------
              //mobilePhone: fields['Mobile Phone'], // ---------Insufficient privileges---------
              //businessPhones: [fields['Work Phone']], // ---------Insufficient privileges---------
              //preferredName: fields['Preferred Name'], // ---------Request not supported---------
              givenName: fields['First Name'],
              //profilePhoto  //TODO: DISCUSS step with Engineers
              //supervisorID  //TODO: CONFIRM if we can link to directoryObject with supervisor Email
            };
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
                return state;
              }
            )(state);
          }
        }
      )(state).then(response => {
        // 1.2 ASSIGN USER TO MANAGER
        const supervisorEmail = employee.fields['Supervisor email'];
        const userPrincipalName = supervisorEmail.replace('@', '_') + '%23EXT%23@w4wtest.onmicrosoft.com'; // Replace # with %23
        // We (1) make a get to fetch the supervisor id.
        get(
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
              const { id } = state.data.body;
              const data = {
                '@odata.id': `${api}/users/${employee.id}`,
              };
              console.log('Assigning user to manager...');
              return put(
                `${api}/users/${id}/manager/$ref`,
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
                state => {}
              )(state);
            } else {
              console.log('Manager not found...');
              return state;
            }
          }
        )(state);

        // 1.3 ADD USER AS MEMEBER TO ADMINISTRATIVE UNIT
        const idsValue = Object.values(state.administrativeUnitsMap);
        // (a) First we make a request to see if the employee is not already a member...
        post(
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
            const { value } = state.data.body;
            
            const administrativeUnitID = state.administrativeUnitsMap[employee.fields.Division]; // Mapping AU name to correct ID
            // ... (b) if he is not we add him.
            if (!value.includes(administrativeUnitID)) {
              console.log('Adding member to the administrative units...');
              const data = {
                '@odata.id': `${api}/directoryObjects/${employee.id}`,
              };
              return post(
                `${api}/directory/administrativeUnits/${administrativeUnitID}/members/$ref`,
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
                state => {}
              )(state);
            } else {
              console.log('Employee is already a member of this administrative unit...');
              return state;
            }
          }
        )(state);

        // 1.4 ADD USER AS MEMBER TO GROUP.
        const groupIdsValue = Object.values(state.groupMap);
        // (a) First we make a request to see if the employee is not already a member...
        post(
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
            const groupID = state.groupMap[employee.fields['Core System Needs']]; // Mapping group name to correct ID
            // ... (b) if he is not we add him.
            if (!value.includes(groupID)) {
              console.log('Adding member to the group...');
              const data = {
                '@odata.id': `${api}/directoryObjects/${employee.id}`,
              };
              return post(
                `${api}/groups/${groupID}/members/$ref`,
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
                state => {}
              )(state);
            } else {
              console.log('Employee is already a member of this group...');
              return state;
            }
          }
        )(state);

        return state;
      });
    } else {
      console.log('nothing to do');
    }
  })
);
