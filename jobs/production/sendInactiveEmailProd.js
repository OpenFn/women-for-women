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
    state.name = employee.fields['First name Last name'];
    state.division = employee.fields['Division'];
    state.supervisor = employee.fields['Supervisor name'];
    state.superEmail = employee.fields['Supervisor email'];
    state.endDate = employee.fields['Termination Date'];
    console.log(state.name, state.workEmail, state.division, state.endDate, state.supervisor, state.superEmail);

    if (activeDivisions.includes(employee.fields.Division)) {
      return send(
        fields(
          field('from', 'WfWI Notifications <notifications@womenforwomen.org>'), 
          field('sender', 'WfWI Notifications'),
          field('h:Reply-To', 'helpdesk@womenforwomen.org'),
          //field('to', 'MAverbuj@womenforwomen.org'), //FOR TESTING
          //field('cc', 'aleksa@openfn.org, jed@openfn.org'), //FOR TESTING
          field('to', `${state.superEmail}`), //TODO: use when ready to send TO supervisor contact
          field('cc', `${divisionEmailMap[employee.fields.Division]}, helpdesk@womenforwomen.org`), //TODO: use when ready to copy division HR
          field('bcc', `maverbuj@womenforwomen.org, cani@womenforwomen.org`), //TODO: use for testing
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
                                                              This is an automated email to let you know that the account for <strong><font color="018374">${state.name}</font></strong> will be deactivated on <strong><font color="018374">${state.endDate}</font></strong> as instructed on the employee record in
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
                                                              href="https://wfwi.atlassian.net/servicedesk/customer/portal/4/group/27/create/90"
                                                              >USER TERMINATION FORM</a
                                                            ><br />
                                                            <br />
                                                            If this termination is being submitted by mistake, please get in touch
                                                            with your HR Officer and <a
                                                              moz-do-not-send="true"
                                                              href="https://help.womenforwomen.org/"
                                                              >IT Helpdesk</a> as soon as possible.<br />
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
                                                    <table cellspacing="0" cellpadding="0" border="0" style="margin-left:auto;margin-right:auto;">
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
    } else {
      console.log('Employee not member of activated Division. No automation executed.');
      return state;
    }
  })
);