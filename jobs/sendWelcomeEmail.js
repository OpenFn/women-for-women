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

    const activeDivisions = ['Headquarters', 'Headquarters - PM Access', 'Nigeria', 'Nigeria - PM Access']; // Add divisions to turn "on"

    const employee = state.data; // We get the current employee
    state.workEmail = employee.fields['Work Email'];
    state.firstName = employee.fields['First Name'];
    state.name = employee.fields['First name Last name'];
    console.log(state.name, state.workEmail);

    if (activeDivisions.includes(employee.fields.Division)) {
      return send(
        fields(
          field('from', 'womenforwomen@irc.openfn.org'), //TODO: replace with WfW domain
          field('to', 'MatiasA@womenforwomen.org'), //TODO: replace with L29
          field('cc', 'aleksa@openfn.org, jed@openfn.org'), //TODO: replace with L30
          //field('to', `${state.workEmail}`), //TODO: use when ready to send TO employee
          //field('cc', `${divisionEmailMap[employee.fields.Division]}`), //TODO: use when ready to copy Division contact
          field('subject', state => {
            var sub = `Welcome to Women for Women International, ${state.name}!`;
            console.log(sub);
            return sub;
          }),
          field('html', state => {
            //WfW welcome template
            var msg = 
`<style type="text/css">
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
<p style="text-transform:uppercase;margin:0;text-align:right"><span style="color:#FFFFFF;font-weight:bold">Global IT Business Services</span><br>
<a href="mailto:#" style="color:#FFFFFF;text-decoration:none" target="_blank">helpdesk@womenforwomen.org</a></p></td>
</table>
</div>
</td>
</tr>
<tr>
<td style="font-family: Calibri, Arial, sans-serif;font-size:20px;text-transform:uppercase;color:#D88C02;font-weight:bold;text-align:center;padding-top:10px;margin:0;" colspan="2"><p style="margin:0;padding:0;">Dear ${state.firstName}, welcome to</p>
<p style="font-size:28px;margin:5px auto;line-height:1.2;color:grey;">Women for Women International!</p></td>
</tr>     
<tr>
<td style="font-family:Calibri, Arial, sans-serif;font-size:15px;padding:20px;padding-top:10px;line-height:1.5;" id="body">
<p>This email will help you get your new @womenforwomen.org account ready so you can start accessing the resources you need to begin communicating and collaborating with the rest of the organization. <br/><br/>Following are your credentials to get started and further down you will find the link to portal.office.com to get into your new Outlook account.</p>
<table width="75%" border="0" align="center" style="margin:20px auto;background:#f0f0f0;border:1px solid #ccc;">
<tr>
<td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:15px;line-height:0.5;"><strong>Name:</strong></td>
<td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:15px;line-height:0.5;">${state.name}</td>
</tr>
<tr>
<td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:15px;line-height:0.5;"><strong>Email:</strong></td>
<td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:15px;line-height:0.5;">${state.workEmail}</td>
</tr>
<tr>
<td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:15px;line-height:0.5;"><strong>Temporary Password</strong></td>
<td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:15px;line-height:0.5;">You'll Never Walk Alone!</td>
</tr>
<tr>
<td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:15px;line-height:0.5;"><strong>Change Your Password At:</strong></td>
<td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:15px;line-height:0.5;"><a href="https://passwordreset.microsoftonline.com/?whr=womenforwomen.org" style="font-weight:bold;color:#3CB371;text-decoration:none">START HERE</a></td>
</tr>
</table>
<p style="text-align:center;font-size:18px;color:#B22222;">IMPORTANT: The above password is your temporary logon to WfWI. You will be asked to change it to a new password and setup multi-factor authentication with your mobile device. This temporary password will expire in 48 hours.</p>
<p style="text-align:center;font-size:18px;color:#3CB371"><strong>Other links to get started:</strong></p>
<table width="75%" border="0" align="center" style="margin:20px auto;background:#f0f0f0;border:1px solid #ccc;">
<tr>
<td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:15px;line-height:0.2;"><strong>Microsoft Teams</strong></td>
<td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:15px;line-height:0.0;"><a href="https://aka.ms/mstfw" style="font-weight:bold;color:#708090;text-decoration:none">https://aka.ms/mstfw</a></td>
</tr>
<tr>
<td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:15px;line-height:0.2;"><strong>Outlook Web</strong></td>
<td style="font-family:Calibri, Arial, sans-serif;font-size:14px;padding:15px;line-height:0.0;"><a href="https://outlook.office.com/" style="font-weight:bold;color:#708090;text-decoration:none">https://outlook.office.com/</a></td>
</tr>
</table>
<p>If you have any questions, do not hesitate to contact our Helpdesk Team via <a href="https://help.womenforwomen.org" style="font-weight:bold;color:#708090;text-decoration:none">live chat</a> or by email to <a href="mailto:helpdesk@womenforwomen.org" style="font-weight:bold;color:#708090;text-decoration:none">helpdesk@womenforwomen.org</a>.</p>
<p>We look forward to working with you!<br/><br/>
Your Helpdesk Team at WfWI</p> 
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
    } else {
      console.log('Employee not member of activated Division. No automation executed.');
      return state;
    }
  })
);
