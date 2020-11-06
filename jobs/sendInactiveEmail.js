//-- Using Mailgun adaptor --
alterState(state => {
    const employee = state.data.employees[0]; //Q: do we need to handle for multiple employee updates at once?
    state.workEmail = employee.fields['Work Email'];
    state.name = employee.fields['First name Last name'];
    state.division = employee.fields['Division'];
    state.supervisor = employee.fields['Supervisor name'];
    state.superEmail = employee.fields['Supervisor email'];
    state.endDate = employee.fields['Termination Date'];
    console.log(state.name, state.workEmail, state.division, state.endDate, state.supervisor, state.superEmail);
    return state;
  });

  //-- SEND INACTIVE EMAIl --
  send(
      fields(
        field('from', 'womenforwomen@irc.openfn.org'), //to update with womenforwomen domain
        field('to', 'MAverbuj@womenforwomen.org'), //'helpdesk-us@womenforwomen.org'), --> harcoding while testing
        field('cc', 'aleksa@openfn.org, jed@openfn.org'),//dataValue('fields.Supervisor email')), --> commenting out while testing
        field('subject', state => {
          var sub = `Account Termination: ${state.name} (${state.division})`;
          console.log(sub);
          return sub;
        }),
        field('html', state => { //WfW welcome template
          var msg = `Greetings! <br><br> 
          User <b>${state.name}</b> from ${state.division} office is scheduled to be terminated on <b>${state.endDate}</b>
          and the supervisor is ${state.supervisor} (${state.superEmail}), if needed for further information.<br><br>
          Thanks for your assistance.`;
          return msg;
        })
      )
  );