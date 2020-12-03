each(
  '$.data.employees[*]',
  alterState(state => {
    const divisionEmailMap = {
      Afghanistan: 'AF_HR_Notifications@womenforwomen.org',
      Headquarters: 'US_HR_Notifications@womenforwomen.org',
      Iraq: 'IQ_HR_Notifications@womenforwomen.org',
      Kosovo: 'XK_HR_Notifications@womenforwomen.org',
      Nigeria: 'NG_HR_Notifications@womenforwomen.org',
      Rwanda: 'RW_HR_Notifications@womenforwomen.org',
      'South Sudan': 'SS_HR_Notifications@womenforwomen.org',
      'The Democratic Republic of the Congo': 'CD_HR_Notifications@womenforwomen.org',
      WOC: 'WOC_HR_Notifications@womenforwomen.org',
    };

    const employee = state.data; // We get the current employee
    state.workEmail = employee.fields['Work Email'];
    state.name = employee.fields['First name Last name'];
    state.division = employee.fields['Division'];
    state.supervisor = employee.fields['Supervisor name'];
    state.superEmail = employee.fields['Supervisor email'];
    state.endDate = employee.fields['Termination Date'];
    console.log(state.name, state.workEmail, state.division, state.endDate, state.supervisor, state.superEmail);

    return send(
      fields(
        field('from', 'womenforwomen@irc.openfn.org'), //TODO: replace with WfW domain
        field('to', 'MAverbuj@womenforwomen.org'), //TODO: replace with L30
        field('cc', 'aleksa@openfn.org, jed@openfn.org'), //TODO: replace with L31
        //field('to', `${divisionEmailMap[employee.fields.Division]}`), //TODO: use when ready to send TO Division contact
        //field('cc', `helpdesk-us@womenforwomen.org`), //TODO: use when ready to copy help-fesk
        field('subject', state => {
          var sub = `Account Termination: ${state.name} (${state.division})`;
          console.log(sub);
          return sub;
        }),
        field('html', state => {
          //WfW Inactive email alert template
          var msg = `Greetings! <br><br> 
          User <b>${state.name}</b> from ${state.division} office is scheduled to be terminated on <b>${state.endDate}</b>
          and the supervisor is ${state.supervisor} (${state.superEmail}), if needed for further information.<br><br>
          Thanks for your assistance.`;
          return msg;
        })
      )
    )(state);
  })
);