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

    const activeDivisions = ['Headquarters', 'Headquarters - PM Access', 'Nigeria', 'Nigeria - PM Access']; // Add divisions to turn "on"

    const employee = state.data; // We get the current employee
    state.workEmail = employee.fields['Work Email'];
    state.name = employee.fields['First name Last name'];
    state.division = employee.fields['Division'];
    state.supervisor = employee.fields['Supervisor name'];
    state.superEmail = employee.fields['Supervisor email'];
    state.endDate = employee.fields['Termination Date'];
    console.log(state.name, state.workEmail, state.division, state.endDate, state.supervisor, state.superEmail);

    if (activeDivisions.includes(employee.fields.Division)) {
      return send(
        fields(
          field('from', 'notifications@womenforwomen.org'), //TODO: replace with WfW domain
          field('to', 'MatiasA@womenforwomen.org'), //TODO: replace with L30
          field('cc', 'aleksa@openfn.org, support@openfn.org'), //TODO: replace with L31
          //field('to', `${divisionEmailMap[employee.fields.Division]}`), //TODO: use when ready to send TO Division contact
          //field('cc', `helpdesk-us@womenforwomen.org`), //TODO: use when ready to copy help-fesk
          field('subject', state => {
            var sub = `Testing 123`;
            console.log(sub);
            return sub;
          }),
          field('html', state => {
            //WfW Inactive email alert template
            //var msg = `paste email template with ${state.dynamicFields} below within back ticks`; 
            var msg =
              `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>New test</title>
  </head>
</html>`;
            return msg;
          })
        )
      )(state);
    } else {
      console.log('Employee not member of activated Division. No automation executed.');
      return state;
    }
  })
);
