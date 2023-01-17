each(
  '$.data.employees[*]',
  alterState(state => {
    const divisionEmailMap = {
      Afghanistan: 'AF_HR_Notifications@womenforwomen.org',
      'Afghanistan - PM Access': 'AF_HR_Notifications@womenforwomen.org',
      'DR Congo': 'CD_HR_Notifications@womenforwomen.org',
      'Germany': 'DE_HR_Notifications@womenforwomen.org',
      'Global Support Center': 'GSC_HR_Notifications@womenforwomen.org',
      Headquarters: 'US_HR_Notifications@womenforwomen.org',
      'Headquarters - PM Access': 'US_HR_Notifications@womenforwomen.org',
      'GSC - United Kingdom': 'US_HR_Notifications@womenforwomen.org',
      Iraq: 'IQ_HR_Notifications@womenforwomen.org',
      'Iraq - PM Access': 'IQ_HR_Notifications@womenforwomen.org',
      Kosovo: 'XK_HR_Notifications@womenforwomen.org',
      'Kosovo - PM Access': 'XK_HR_Notifications@womenforwomen.org',
      Nigeria: 'NG_HR_Notifications@womenforwomen.org',
      'Nigeria - PM Access': 'NG_HR_Notifications@womenforwomen.org',
      Rwanda: 'RW_HR_Notifications@womenforwomen.org',
      'Rwanda - PM Access': 'RW_HR_Notifications@womenforwomen.org',
      'South Sudan': 'SS_HR_Notifications@womenforwomen.org',
      'South Sudan - PM Access': 'SS_HR_Notifications@womenforwomen.org',
      'The Democratic Republic of the Congo': 'CD_HR_Notifications@womenforwomen.org',
      'The Democratic Republic of the Congo - PM Access': 'CD_HR_Notifications@womenforwomen.org',
      'United Kingdom': 'UK_HR_Notifications@womenforwomen.org',
      'United Kingdom - PM Access': 'UK_HR_Notifications@womenforwomen.org',
      'United States': 'US_HR_Notifications@womenforwomen.org',
      'United States - PM Access': 'US_HR_Notifications@womenforwomen.org',
      WOC: 'WOC_HR_Notifications@womenforwomen.org',
      'WOC - PM Access': 'WOC_HR_Notifications@womenforwomen.org',
    };

    const activeDivisions = [
    'Afghanistan',
    'Afghanistan - PM Access',
    'DR Congo',
    'GSC - United Kingdom',
    'Germany',
    'Global Support Center',
    'Headquarters',
    'Headquarters - PM Access',
    'Iraq',
    'Iraq - PM Access',
    //'Kosovo',
    'Nigeria',
    'Nigeria - PM Access',
    //'Rwanda',
    'South Sudan',
    'South Sudan - PM Access',
    'The Democratic Republic of the Congo',
    'The Democratic Republic of the Congo - PM Access',
    'United Kingdom',
    'United States',
    //'WOC',
    //'No Division'
  ]; // Add divisions to turn "on"

    const employee = state.data; // We get the current employee
    state.workEmail = employee.fields['Work Email'];
    state.homeEmail = employee.fields['Home Email'];
    state.name = employee.fields['First name Last name'];
    state.firstName = employee.fields['First Name'];
    state.division = employee.fields['Division'];
    state.supervisor = employee.fields['Supervisor name']
      ? employee.fields['Supervisor name'].split(',')[1]
      : 'Supervisor';
    state.superEmail = employee.fields['Supervisor email'];
    console.log(state.name, state.workEmail, state.firstName, state.division, state.supervisor, state.superEmail);

    if (activeDivisions.includes(employee.fields.Division)) {
      if (!employee.fields['Work Email']) {
        console.log(`No Azure actions taken because 'Work Email' not provided for ${fields['First name Last name']}.`);
        return state;
      } else {
        if (
          !employee.fields['Email User Type'] ||
          employee.fields['Email User Type'] === 'Does not need email account'
        ) {
          console.log(
            `No Azure actions taken because employee 'does not need email account' or email not specified - see Email User Type: ${employee.fields['Email User Type']}`
          );
          return state;
        }
      return send(
        fields(
          field('from', 'WfWI Notifications <notifications@womenforwomen.org>'), 
          field('sender', 'WfWI Notifications'),
          field('h:Reply-To', 'helpdesk@womenforwomen.org'),
          // field('to', 'MAverbujA@womenforwomen.org'), //FOR TESTING
          // field('cc', 'aleksa@openfn.org, jed@openfn.org'), //FOR TESTING
          field('to', `${state.superEmail}`), //TODO: use when ready to send TO supervisor contact
          field('cc', `${divisionEmailMap[employee.fields.Division]}`), //TODO: use when ready to copy Division HR contact
          field('bcc', `maverbuj@womenforwomen.org, cani@womenforwomen.org`), //TODO: use for testing
          field('subject', state => {
            var sub = `New Account: ${state.name} (${state.division})`;
            console.log(sub);
            return sub;
          }),
          field('html', state => {
            //WfW email template for notifying supervisors of new employee setup
            //var msg = `paste email template with ${state.dynamicFields} below within back ticks`; 
            var msg =
              `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
              <html>
                <head>
                  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                  <title></title>
                </head>
                <body>
                  <div
                    style="
                      padding: 0 !important;
                      margin: 0 !important;
                      display: block !important;
                      min-width: 100% !important;
                      width: 100% !important;
                      background: #eeeeee;
                    "
                  >
                    <span
                      style="display: none; font-size: 0px; line-height: 0px; max-height: 0px; max-width: 0px; overflow: hidden"
                    ></span>
                    <table width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#FFFFFF">
                      <tbody>
                        <tr>
                          <td valign="top" align="center">
                            <table width="100%" cellspacing="0" cellpadding="0" border="0">
                              <tbody>
                                <tr>
                                  <td align="center">
                                    <table width="700" cellspacing="0" cellpadding="0" border="0">
                                      <tbody>
                                        <tr>
                                          <td
                                            style="
                                              width: 700px;
                                              min-width: 700px;
                                              font-size: 0pt;
                                              line-height: 0pt;
                                              padding: 0;
                                              margin: 0;
                                              font-weight: normal;
                                            "
                                          >
                                            <table width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff">
                                              <tbody>
                                                <tr>
                                                  <td style="padding: 30px 0px 30px 0px">
                                                    <table width="100%" cellspacing="0" cellpadding="0" border="0">
                                                      <tbody>
                                                        <tr>
                                                          <td style="font-size: 0pt; line-height: 0pt; text-align: center">
                                                            <img
                                                              src="https://us05.rocketseed.com/img/2112"
                                                              style="max-width: 250px"
                                                              alt=""
                                                              width="250"
                                                              border="0"
                                                            />
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                            <table width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff">
                                              <tbody>
                                                <tr>
                                                  <td style="padding: 30px 30px">
                                                    <table width="100%" cellspacing="0" cellpadding="0" border="0">
                                                      <tbody>
                                                        <tr>
                                                          <td
                                                            style="
                                                              color: #000000;
                                                              font-family: 'Mulish', Calibri, Arial, sans-serif;
                                                              font-size: 18px;
                                                              line-height: 20px;
                                                              text-align: left;
                                                              padding-bottom: 15px;
                                                            "
                                                          >
                                                            <strong>Dear ${state.supervisor},</strong>
                                                          </td>
                                                        </tr>
                                                        <tr>
                                                          <td
                                                            style="
                                                              color: #000000;
                                                              font-family: 'Mulish', Calibri, Arial, sans-serif;
                                                              font-size: 18px;
                                                              line-height: 20px;
                                                              text-align: left;
                                                              padding-bottom: 15px;
                                                            "
                                                          >
                                                            We have setup the new account for ${state.name} and we have emailed
                                                            ${state.homeEmail} instructions to get started.<br />
                                                          </td>
                                                        </tr>
                                                        <tr>
                                                          <td
                                                            style="
                                                              color: #000000;
                                                              font-family: 'Mulish', Calibri, Arial, sans-serif;
                                                              font-size: 18px;
                                                              line-height: 20px;
                                                              text-align: left;
                                                              padding-bottom: 15px;
                                                            "
                                                          >
                                                            Please, make sure to welcome ${state.firstName} on Teams by
                                                            <a
                                                              moz-do-not-send="true"
                                                              href="https://teams.microsoft.com/l/chat/0/0?users=${state.workEmail}"
                                                              >clicking here</a
                                                            >.<br />
                                                            <br />
                                                            If you have any questions, do not hesitate to contact our Helpdesk Team
                                                            via Teams or by email to helpdesk@womenforwomen.org.<br />
                                                            <br />
                                                            Regards,<br />
                                                            <br />
                                                            IT@WfWI<br />
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <table width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff">
                                      <tbody>
                                        <tr>
                                          <td style="padding: 10px 20px 0px">
                                            <table width="100%" cellspacing="0" cellpadding="0" border="0">
                                              <tbody>
                                                <tr>
                                                  <td
                                                    style="
                                                      color: #000000;
                                                      font-family: 'Mulish', Calibri, Arial, sans-serif;
                                                      font-size: 18px;
                                                      line-height: 22px;
                                                      text-align: center;
                                                      text-transform: uppercase;
                                                      padding-bottom: 20px;
                                                    "
                                                  >
                                                    <div>f o l l o w u s</div>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td style="padding-bottom: 20px" align="center">
                                                    <table cellspacing="0" cellpadding="0" border="0">
                                                      <tbody>
                                                        <tr>
            <td style="font-size: 0pt; line-height: 0pt; text-align: center;" width="40"><a href="https://www.instagram.com/womenforwomen/" target="_blank" rel="noopener"><img style="max-width: 32px; display: block; margin-left: auto; margin-right: auto;" src="https://i.ibb.co/59BQ3Wd/instagram.png" alt="" width="32" height="32" border="0" /></a></td>
            <td style="font-size: 0pt; line-height: 0pt; text-align: center;" width="40"><a href="https://www.facebook.com/womenforwomen" target="_blank" rel="noopener"><img style="max-width: 32px; display: block; margin-left: auto; margin-right: auto;" src="https://i.ibb.co/xGJmDgD/facebook.png" alt="" width="32" height="32" border="0" /></a></td>
            <td style="font-size: 0pt; line-height: 0pt; text-align: center;" width="40"><a href="https://www.linkedin.com/company/women-for-women-international/" target="_blank" rel="noopener"><img style="max-width: 32px; display: block; margin-left: auto; margin-right: auto;" src="https://i.ibb.co/BzyvWbv/linkedin.png" alt="" width="32" height="32" border="0" /></a></td>
            <td style="font-size: 0pt; line-height: 0pt; text-align: center;" width="40"><a href="https://twitter.com/WomenforWomen" target="_blank" rel="noopener"><img style="max-width: 32px; display: block; margin-left: auto; margin-right: auto;" src="https://i.ibb.co/DWLmY7L/twitter.png" alt="" width="32" height="32" border="0" /></a></td>
            </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </body>
              </html>`;
            return msg;
          })
        )
      )(state);
       }
    } else {
      console.log('Employee not member of activated Division. No automation executed.');
      return state;
    }
  })
);
