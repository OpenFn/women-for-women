//-- Using Mailgun adaptor --
//-- SEND WELCOME EMAIl --
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

    //const activeDivisions = ['Afghanistan', 'Afghanistan - PM Access', 'Headquarters', 'Headquarters - PM Access', 'Nigeria', 'Nigeria - PM Access']; // Old method

    const employee = state.data; // We get the current employee
    state.workEmail = employee.fields['Work Email'];
    state.homeEmail = employee.fields['Home Email']
    state.firstName = employee.fields['First Name'];
    state.userType = employee.fields['Email User Type'];
    state.name = employee.fields['First name Last name'];
    console.log(state.name, state.workEmail);

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
            // field('to', 'MAverbuj@womenforwomen.org'), //TODO: replace with L29
            // field('cc', 'aleksa@openfn.org, jed@openfn.org'), //TODO: replace with L30
            field('to', `${state.homeEmail}, ${state.workEmail}`), //TODO: use when ready to send TO employee
            field('cc', `${divisionEmailMap[employee.fields.Division]}`), //TODO: use when ready to copy Division contact
            field('bcc', `maverbuj@womenforwomen.org, cani@womenforwomen.org`), //TODO: use for testing
            field('subject', state => {
              var sub = `Welcome to Women for Women International, ${state.firstName}!`;
              console.log(sub);
              return sub;
            }),
            field('html', state => {
              //WfW welcome template
              //var msg = `paste email template with ${state.dynamicFields} below within back ticks`; 
              var msg =
                `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
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
        style="
          display: none;
          font-size: 0px;
          line-height: 0px;
          max-height: 0px;
          max-width: 0px;
          overflow: hidden;
        "
      ></span>

      <table
        width="100%"
        border="0"
        cellspacing="0"
        cellpadding="0"
        bgcolor="#FFFFFF"
      >
        <tr>
          <td align="center" valign="top">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center">
                  <table width="700" border="0" cellspacing="0" cellpadding="0">
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
                        <table
                          width="100%"
                          border="0"
                          cellspacing="0"
                          cellpadding="0"
                          bgcolor="#ffffff"
                        >
                          <tr>
                            <td style="padding: 30px 0px 30px 0px">
                              <table
                                width="100%"
                                border="0"
                                cellspacing="0"
                                cellpadding="0"
                              >
                                <tr>
                                  <td
                                    style="
                                      font-size: 0pt;
                                      line-height: 0pt;
                                      text-align: center;
                                    "
                                  >
                                    <img
                                      src="https://us05.rocketseed.com/img/2112"
                                      width="250"
                                      style="max-width: 250px"
                                      border="0"
                                      alt=""
                                    />
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>

                        <table
                          width="100%"
                          border="0"
                          cellspacing="0"
                          cellpadding="0"
                          bgcolor="#ffffff"
                        >
                          <tr>
                            <td style="padding: 30px 30px">
                              <table
                                width="100%"
                                border="0"
                                cellspacing="0"
                                cellpadding="0"
                              >
                                <tr>
                                  <td
                                    style="color:#000000;font-family:&#39;Mulish&#39;,Calibri,Arial,sans-serif;font-size:18px;line-height:20px;text-align:left;padding-bottom:15px"
                                  >
                                    <strong>Dear ${state.firstName},</strong>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    style="color:#000000;font-family:&#39;Mulish&#39;,Calibri,Arial,sans-serif;font-size:18px;line-height:20px;text-align:left;padding-bottom:15px"
                                  >
                                    This email will help you get your new @<a
                                      href="http://womenforwomen.org"
                                      target="_blank"
                                      >womenforwomen.org</a
                                    >
                                    account ready so you can start accessing the
                                    resources you need to begin communicating
                                    and collaborating with everyone in the
                                    organization. <br />
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    style="color:#000000;font-family:&#39;Mulish&#39;,Calibri,Arial,sans-serif;font-size:18px;line-height:20px;text-align:left;padding-bottom:15px"
                                  >
                                    Following are your temporary credentials to
                                    get started and further down you will find
                                    links to get into your new Outlook and Teams
                                    account.
                                    <br />
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    align="center"
                                    style="
                                      padding-top: 20px;
                                      padding-bottom: 30px;
                                    "
                                  >
                                    <table
                                      width="80%"
                                      border="0"
                                      cellspacing="0"
                                      cellpadding="0"
                                      bgcolor="#F5B2AD"
                                    >
                                      <tr>
                                        <td
                                          style="background:#f5b2ad;color:#018374;font-family:&#39;Mulish&#39;,Calibri,Arial,sans-serif;padding-top:10px;padding-bottom:10px;font-size:22px;line-height:28px;text-align:center"
                                        >
                                          <div>Temporary Credentials</div>
                                        </td>
                                      </tr>
                                    </table>
                                    <table
                                      width="80%"
                                      border="0"
                                      cellspacing="0"
                                      cellpadding="0"
                                      bgcolor="#00997b"
                                      style="
                                        padding: 0px 8px;
                                        border-collapse: collapse;
                                      "
                                    >
                                      <tr>
                                        <th width="40%"></th>
                                        <th width="60%"></th>
                                      </tr>

                                      <tr>
                                        <td
                                          valign="middle"
                                          style="color:#2f2f2f;background:#01c5af;font-family:&#39;Mulish&#39;,Calibri,Arial,sans-serif;font-size:18px;line-height:24px;text-align:left;padding:10px"
                                        >
                                          <div><strong> Name: </strong></div>
                                        </td>
                                        <td
                                          valign="middle"
                                          style="color:#ffffff;background:#01c5af;font-family:&#39;Mulish&#39;,Calibri,Arial,sans-serif;font-size:18px;text-transform:capitalize;line-height:24px;text-align:left;padding:10px"
                                        >
                                          ${state.name}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td
                                          valign="middle"
                                          style="color:#2f2f2f;background:#018374;font-family:&#39;Mulish&#39;,Calibri,Arial,sans-serif;font-size:18px;line-height:24px;text-align:left;padding:10px"
                                        >
                                          <div><strong> Email:</strong></div>
                                        </td>
                                        <td
                                          valign="middle"
                                          style="color:#ffffff;background:#018374;font-family:&#39;Mulish&#39;,Calibri,Arial,sans-serif;font-size:18px;text-transform:capitalize;line-height:24px;text-align:left;padding:10px"
                                          > <a href='#' style='text-decoration:none'>${state.workEmail}</a>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td
                                          valign="middle"
                                          style="color:#2f2f2f;background:#01c5af;font-family:&#39;Mulish&#39;,Calibri,Arial,sans-serif;font-size:18px;line-height:24px;text-align:left;padding:10px"
                                        >
                                          <div>
                                            <strong>Temporary Password </strong>
                                          </div>
                                        </td>
                                        <td
                                          valign="middle"
                                          style="color:#ffffff;background:#01c5af;font-family:&#39;Mulish&#39;,Calibri,Arial,sans-serif;font-size:18px;line-height:24px;text-align:left;padding:10px"
                                        >
                                          You&#39;ll Never Walk Alone!
                                        </td>
                                      </tr>
                                      <tr>
                                        <td
                                          valign="middle"
                                          style="color:#2f2f2f;background:#018374;font-family:&#39;Mulish&#39;,Calibri,Arial,sans-serif;font-size:18px;line-height:24px;text-align:left;padding:10px"
                                        >
                                          <div>
                                            <strong>Change Password:</strong>
                                          </div>
                                        </td>
                                        <td
                                          valign="middle"
                                          style="color:#ffffff;background:#018374;font-family:&#39;Mulish&#39;,Calibri,Arial,sans-serif;font-size:18px;line-height:24px;text-align:left;padding:10px"
                                        >
                                          <a
                                            href="https://login.microsoftonline.com/?whr=womenforwomen.org"
                                            style="
                                              color: #ffffff;
                                              text-decoration: underline;
                                            "
                                            target="_blank"
                                            ><span
                                              style="
                                                color: #ffffff;
                                                text-decoration: underline;
                                              "
                                              ><strong>START HERE</strong></span
                                            ></a
                                          >
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    style="color:#a32638;font-family:&#39;Mulish&#39;,Calibri,Arial,sans-serif;font-size:18px;line-height:18px;text-align:left;padding-bottom:15px"
                                  >
                                    <br /><strong>Important:</strong> The above
                                    password is your temporary logon to WfWI.
                                    You will be asked to change it to a new
                                    password and setup multi-factor
                                    authentication with your mobile device. This
                                    temporary password will expire in 48 hours.
                                    <br />
                                  </td>
                                </tr>

                                <tr>
                                  <td
                                    align="center"
                                    style="
                                      padding-top: 15px;
                                      padding-bottom: 10px;
                                    "
                                  >
                                    <table
                                      width="400px"
                                      border="0"
                                      cellspacing="0"
                                      cellpadding="0"
                                    >
                                      <tr>
                                        <th
                                          width="200px"
                                          style="
                                            font-size: 0pt;
                                            line-height: 0pt;
                                            padding: 0;
                                            margin: 0;
                                            font-weight: normal;
                                            vertical-align: center;
                                          "
                                        >
                                          <table
                                            align="center"
                                            width="100px"
                                            border="0"
                                            cellspacing="2"
                                            cellpadding="1"
                                          >
                                            <tr>
                                              <td
                                                style="font-family:&#39;Raleway&#39;,Arial,sans-serif;font-size:18px;line-height:22px;text-align:center;font-weight:bold"
                                              >
                                                <div>
                                                  <a
                                                    href="https://outlook.office.com/"
                                                    style="
                                                      color: #4e54cb;
                                                      text-decoration: none;
                                                    "
                                                    target="_blank"
                                                    ><img
                                                      src="https://th.bing.com/th/id/R3f0d0825e77de5c16ad70889bbcf3b09?rik=0mn0qg2UL6TyLg&amp;riu=http%3a%2f%2fwww.softsolutionworks.com%2fimages%2fOutlook%2fOutlook.png&amp;ehk=ckhb0FzDr4Q4OTOfZ0848Uofgl2FHDJLGyCG5ETvls4%3d&amp;risl=&amp;pid=ImgRaw"
                                                      width="150px"
                                                      style="max-width: 175px"
                                                      border="0"
                                                      alt=""
                                                  /></a>
                                                </div>
                                              </td>
                                            </tr>
                                          </table>
                                        </th>
                                        <th
                                          style="
                                            font-size: 0pt;
                                            line-height: 0pt;
                                            padding: 0;
                                            margin: 0;
                                            font-weight: normal;
                                            vertical-align: center;
                                          "
                                        >
                                          <table
                                            align="center"
                                            width="200px"
                                            border="0"
                                            cellspacing="2"
                                            cellpadding="1"
                                          >
                                            <tr>
                                              <td
                                                style="font-family:&#39;Raleway&#39;,Arial,sans-serif;font-size:18px;line-height:22px;text-align:center;font-weight:bold"
                                              >
                                                <div>
                                                  <a
                                                    href="https://aka.ms/mstfw"
                                                    style="
                                                      color: #4e54cb;
                                                      text-decoration: none;
                                                    "
                                                    target="_blank"
                                                  >
                                                    <img
                                                      src="https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE2Z7GW?ver=0ab9&amp;q=90&amp;m=2&amp;h=768&amp;w=1024&amp;b=%23FFFFFFFF&amp;aim=true"
                                                      width="130px"
                                                      height="75px"
                                                      style="max-width: 175px"
                                                      border="0"
                                                    />
                                                  </a>
                                                </div>
                                              </td>
                                            </tr>
                                          </table>
                                        </th>
                                      </tr>
                                      <tr>
                                        <td
                                          style="color:#000000;font-family:&#39;Mulish&#39;,Calibri,Arial,sans-serif;font-size:18px;line-height:20px;text-align:center;padding-bottom:15px"
                                        >
                                          Microsoft Outlook
                                        </td>
                                        <td
                                          style="color:#000000;font-family:&#39;Mulish&#39;,Calibri,Arial,sans-serif;font-size:18px;line-height:20px;text-align:center;padding-bottom:15px"
                                        >
                                          Microsoft Teams
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>

                          <tr>
                            <td
                              style="color:#000000;font-family:&#39;Mulish&#39;,Calibri,Arial,sans-serif;font-size:18px;line-height:20px;text-align:left;padding-bottom:25px"
                            >
                              <br />If you have any questions, do not hesitate
                              to contact our Helpdesk Team via
                              <a
                                href="https://teams.microsoft.com/l/chat/0/0?users=maverbuj@womenforwomen.org,cani@womenforwomen.org&amp;topicName=NEW+USER+%7C+Requesting+Support&amp;message=Welcome+to+Women+for+Women+International!+How+can+we+help+you?"
                                target="_blank"
                              >
                                <span
                                  style="
                                    color: #f55c40;
                                    text-decoration: underline;
                                  "
                                  >live chat</span
                                ></a
                              >
                              or by email to
                              <a
                                href="mailto:helpdesk@womenforwomen.org"
                                style="
                                  color: #f55c40;
                                  text-decoration: underline;
                                "
                                target="_blank"
                                ><span
                                  style="
                                    color: #f55c40;
                                    text-decoration: underline;
                                  "
                                  >helpdesk@womenforwomen.org</span
                                ></a
                              >.
                            </td>
                          </tr>

                          <tr>
                            <td
                              style="color:#000000;font-family:&#39;Mulish&#39;,Calibri,Arial,sans-serif;font-size:18px;line-height:20px;text-align:left;padding-bottom:10px"
                            >
                              We look forward to working with you! <br />
                            </td>
                          </tr>
                          <tr>
                            <td
                              style="color:#000000;font-family:&#39;Mulish&#39;,Calibri,Arial,sans-serif;font-size:18px;line-height:20px;text-align:left;padding-bottom:15px"
                            >
                              IT@WfWI
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <table
                    width="100%"
                    border="0"
                    cellspacing="0"
                    cellpadding="0"
                    bgcolor="#ffffff"
                  >
                    <tr>
                      <td style="padding: 10px 20px 0px">
                        <table
                          width="100%"
                          border="0"
                          cellspacing="0"
                          cellpadding="0"
                        >
                          <tr>
                            <td
                              style="color:#000000;font-family:&#39;Mulish&#39;,Calibri,Arial,sans-serif;font-size:18px;line-height:22px;text-align:center;text-transform:uppercase;padding-bottom:20px"
                            >
                              <div>f o l l o w u s</div>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding-bottom: 20px">
                              <table border="0" cellspacing="0" cellpadding="0">
                                <tr>
<td style="font-size: 0pt; line-height: 0pt; text-align: center;" width="40"><a href="https://www.instagram.com/womenforwomen/" target="_blank" rel="noopener"><img style="max-width: 32px; display: block; margin-left: auto; margin-right: auto;" src="https://i.ibb.co/59BQ3Wd/instagram.png" alt="" width="32" height="32" border="0" /></a></td>
<td style="font-size: 0pt; line-height: 0pt; text-align: center;" width="40"><a href="https://www.facebook.com/womenforwomen" target="_blank" rel="noopener"><img style="max-width: 32px; display: block; margin-left: auto; margin-right: auto;" src="https://i.ibb.co/xGJmDgD/facebook.png" alt="" width="32" height="32" border="0" /></a></td>
<td style="font-size: 0pt; line-height: 0pt; text-align: center;" width="40"><a href="https://www.linkedin.com/company/women-for-women-international/" target="_blank" rel="noopener"><img style="max-width: 32px; display: block; margin-left: auto; margin-right: auto;" src="https://i.ibb.co/BzyvWbv/linkedin.png" alt="" width="32" height="32" border="0" /></a></td>
<td style="font-size: 0pt; line-height: 0pt; text-align: center;" width="40"><a href="https://twitter.com/WomenforWomen" target="_blank" rel="noopener"><img style="max-width: 32px; display: block; margin-left: auto; margin-right: auto;" src="https://i.ibb.co/DWLmY7L/twitter.png" alt="" width="32" height="32" border="0" /></a></td>
</tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
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
