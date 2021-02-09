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

    const activeDivisions = ['Headquarters', 'Headquarters - PM Access']; // Add divisions to turn "on"

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
          field('from', 'womenforwomen@irc.openfn.org'), //TODO: replace with WfW domain
          field('to', 'MAverbuj@womenforwomen.org'), //FOR TESTING
          //field('cc', 'aleksa@openfn.org, jed@openfn.org'), //FOR TESTING
          field('to', `$state.superEmail`), //TODO: use when ready to send TO Division contact
          field('cc', `${divisionEmailMap[employee.fields.Division]}`), //TODO: use when ready to send TO Division contact
          field('cc', `helpdesk-us@womenforwomen.org`), //TODO: use when ready to copy help-fesk
          //field('cc', `helpdesk-us@womenforwomen.org`), //TODO: use when ready to copy help-fesk
          field('subject', state => {
            var sub = `Account Termination: ${state.name} (${state.division})`;
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
    <title>New termination email</title>
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
                                              <strong>Dear Supervisor,</strong>
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
                                              <p>
                                                This is an automated email to let you know that we have inactivated the
                                                account for ${state.name} as instructed on the employee record in
                                                BambooHR.
                                              </p>
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
                                              Please, complete the following form for proper handling of this
                                              account.<br />
                                              <br />
                                              <a
                                                moz-do-not-send="true"
                                                href="https://help.womenforwomen.org/portal/4/create/64"
                                                >USER TERMINATION FORM</a
                                              ><br />
                                              <br />
                                              If this termination is being submitted by mistake, please get in touch
                                              with your HR Officer and IT Helpdesk as soon as possible.<br />
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
                                            <td style="font-size: 0pt; line-height: 0pt; text-align: left" width="40">
                                              <a href="https://www.instagram.com/womenforwomen/" target="_blank"
                                                ><img
                                                  src="https://i.ibb.co/59BQ3Wd/instagram.png"
                                                  style="max-width: 32px"
                                                  alt=""
                                                  height="32"
                                                  width="32"
                                                  border="0"
                                              /></a>
                                            </td>
                                            <td style="font-size: 0pt; line-height: 0pt; text-align: left" width="40">
                                              <a href="https://www.facebook.com/womenforwomen" target="_blank"
                                                ><img
                                                  src="https://i.ibb.co/xGJmDgD/facebook.png"
                                                  style="max-width: 32px"
                                                  alt=""
                                                  height="32"
                                                  width="32"
                                                  border="0"
                                              /></a>
                                            </td>
                                            <td style="font-size: 0pt; line-height: 0pt; text-align: left" width="40">
                                              <a
                                                href="https://www.linkedin.com/company/women-for-women-international/"
                                                target="_blank"
                                                ><img
                                                  src="https://i.ibb.co/BzyvWbv/linkedin.png"
                                                  style="max-width: 32px"
                                                  alt=""
                                                  height="32"
                                                  width="32"
                                                  border="0"
                                              /></a>
                                            </td>
                                            <td style="font-size: 0pt; line-height: 0pt; text-align: left" width="40">
                                              <a href="https://twitter.com/WomenforWomen" target="_blank"
                                                ><img
                                                  src="https://i.ibb.co/DWLmY7L/twitter.png"
                                                  style="max-width: 32px"
                                                  alt=""
                                                  height="32"
                                                  width="32"
                                                  border="0"
                                              /></a>
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
    } else {
      console.log('Employee not member of activated Division. No automation executed.');
      return state;
    }
  })
);