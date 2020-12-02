//-- Using Mailgun adaptor --
//-- SEND WELCOME EMAIl --

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
    console.log(state.name, state.workEmail);

    return send(
      fields(
        field('from', 'womenforwomen@irc.openfn.org'), //to update with womenforwomen domain
        field('to', `${state.workEmail}`), //dataValue('fields.Work Email')), --> harcoding while testing
        field('cc', `${divisionEmailMap[employee.fields.Division]}`), //dataValue('fields.Supervisor email')), --> commenting out while testing
        field('subject', state => {
          var sub = `Welcome to Women for Women, ${state.name}!`;
          // console.log(sub);
          return sub;
        }),
        field('html', state => {
          //WfW welcome template
          var msg = `<style type="text/css">
        @media screen and (max-width: 600px) {
        #main-table {width:100%!important;border:0!important;}
        #logo,#dept,#social-media,#address {width:100%!important;padding:0!important}	
        .mobile-hide, #dept-logo, #header-image {display:none!important;}
        #dept p, #address p {text-align:center!important;}
        #dept table, #social-media table {margin:5px auto 0 auto!important;}	
        #body {padding:10px 0 10px 0!important;}
        #body li {margin-left:-20px!important;}
        }
        </style>
        <table style="max-width:700px;margin:0 auto;border-spacing:0;background:white;border:10px solid #f0f0f0;" id="main-table">
                                <tbody>
                                     <tr>
                           <td style="background-color:#333;height:60px;">
                             <div style="float:left;padding-left:2%;" align="left" id="logo">
                             <img src="https://support.womenforwomen.org/files/womenforwomen/logo-color.png" alt="WfWI Logo" style="max-height:40px;padding-top:5px;display:block;margin:0 auto;"></div>
                          <div style="float:right;padding-right:2%;" align="right" id="dept">
                          <table><td style="font-family:Calibri,Arial,sans-serif;font-size:14px;color:white">
                            <p style="text-transform:uppercase;margin:0;text-align:right"><span style="color:#5E663A;font-weight:bold">human resources</span><br>
                            <a href="mailto:#" style="color:#5E663A;text-decoration:none" target="_blank">???@womenforwomen.org</a></p></td>
                              <td style="vertical-align:middle;width:60px;" id="dept-logo"><img src="https://lh3.googleusercontent.com/proxy/uOs-H_zH1biGbirXvnwsvi5OOwuTC1s5UbmgbsnFD3YbpNoQ6ByjAfJxVbKU5NF8H_p43NZTT4TX9Z95Kk4CsokCQgiMlB5gWMIsDrUFHuroixV5jkAJ2GyP4W6e_OMZ8JOpqvfY3S4sUoB1PF9ux7q0AbhGPZEpKxtHletIHkc" style="max-height:40px;padding-left:15px;">
                              </td></table>
                            </div>
        </td>
                        </tr>
                               <tr>
             <td style="font-family: Calibri, Arial, sans-serif;font-size:20px;text-transform:uppercase;color:#D88C02;font-weight:bold;text-align:center;padding-top:10px;margin:0;" colspan="2"><p style="margin:0;padding:0;">congratulations and welcome to</p>
                                  <p style="font-size:28px;margin:5px auto;line-height:1.2;color:grey;">Women for Women International!</p></td>
                            </tr>     
                                    <tr>
                                        <td style="font-family:Calibri, Arial, sans-serif;font-size:15px;padding:20px;padding-top:10px;line-height:1.5;" id="body">
                                       <p>We are honored to welcome you to the organization and we look forward to working with you. In order to get your onboarding process started, we first need to setup your official account. Here is a summary of your new logon information and proceed to setup a new password.</p>
                                       <table width="75%" border="0" align="center" style="margin:20px auto;background:#f0f0f0;border:1px solid #ccc;">
                                         <tr>
                                           <td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:10px;line-height:0.5;"><strong>Name:</strong></td>
                                           <td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:20px;line-height:0.5;">${state.name}</td>
                                         </tr>
                                         <tr>
                                           <td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:10px;line-height:0.5;"><strong>Email:</strong></td>
                                           <td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:20px;line-height:0.5;">${state.workEmail} </td>
                                         </tr>
                                         <tr>
                                          <td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:10px;line-height:0.5;"><strong>Temporary Password</strong></td>
                                           <td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:20px;line-height:0.5;">"You'll Never Walk Alone!"</td>
                                         </tr>
                                         <tr>
                                           <td style="font-family:Calibri, Arial, sans-serif;font-size:14x;padding:10px;line-height:0.5;"><strong>Change Your Password At:</strong></td>
                                           <td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:20px;line-height:0.5;"><a href="https://passwordreset.microsoftonline.com/?whr=womenforwomen.org" style="font-weight:bold;color:#D88C02;text-decoration:none">CLICK HERE</a></td>
                                         </tr>
                                       </table>
                                       <p style="text-align:center;font-size:18px;"><strong>IMPORTANT: The above password is your temporary logon to WfWI, which should be changed to a new password using our password portal immediately. If this is not done within 48 hours, your account will be disabled!</strong> </p>
                                       <p style="text-align:center;font-size:18px;">For detailed instructions on how to register for our password portal and change your password, <a href="#"style="font-weight:bold;color:#D88C02;text-decoration:none">visit here.</a></p>
                                       <p style="text-align:center;font-size:18px;color:#D88C02"><strong>Other important Links:</strong></p>
                                       <table width="75%" border="0" align="center" style="margin:20px auto;background:#f0f0f0;border:1px solid #ccc;">
                                         <tr>
                                           <td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:10px;line-height:0.2;"><strong>Email Logon:</strong></td>
                                           <td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:20px;line-height:0.0;"><a href="https://www.office.com/" style="font-weight:bold;color:#D88C02;text-decoration:none">https://www.office.com/</a></td>
                                         </tr>
                                         <tr>
                                           <td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:10px;line-height:0.0;"><strong>Our Help Center:</strong></td>
                                           <td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:20px;line-height:0.2;"><a href="https://help.womenforwomen.org" style="font-weight:bold;color:#D88C02;text-decoration:none">https://help.womenforwomen.org</a></td>
                                         </tr>
                                       </table>
                                       <p>If you have any questions, do not hesitate to contact us at <a href="mailto:#" style="font-weight:bold;color:#D88C02;text-decoration:none">???@womenforwomen.org</a>.</p>
                                       <p>Thanks,<br/>
                                       WfWI Human Resources</p> 
                                      </td>
                                    </tr>
                                    <tr>
                                <td style="background-color:#333;padding:10px">
                                <div style="float:left;padding-left:2%;" align="left" id="address">
                                <p style="text-align:left;font-family:Calibri,Arial,sans-serif;color:white;font-size:12px;margin:0;padding-top:5px;">2000 M Sreet NW Suite 200, Washington, DC 20036 USA</p></div>
         <div style="float:right;padding-right:2%;" align="right" id="social-media">
                                <table>
                                    <td style="margin:0 auto;"><a href="https://www.facebook.com/womenforwomen" target="_blank"><img src="https://www.womenforwomen.org/themes/custom/ts_wfw/images/svgs/facebook.svg" style="max-height:20px;padding-right:15px;"></a></td>
                                    <td style="margin-left:auto;margin-right:auto"><a href="https://twitter.com/WomenforWomen" target="_blank"><img src="https://www.womenforwomen.org/themes/custom/ts_wfw/images/svgs/twitter.svg" style="max-height:20px;padding-right:15px;"></a></td>
                                  </table></div>
                                  </td>
        
                                </table>
          </tr>
                                </tbody>
                            </table>`;
          return msg;
        })
      )
    )(state);
  })
);
