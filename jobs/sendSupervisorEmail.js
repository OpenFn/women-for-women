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

    const activeDivisions = ['Headquarters', 'Nigeria']; // Add divisions to turn "on"

    const employee = state.data; // We get the current employee
    state.workEmail = employee.fields['Work Email'];
    state.name = employee.fields['First name Last name'];
    state.firstName = employee.fields['First Name'];
    state.division = employee.fields['Division'];
    state.supervisor = employee.fields['Supervisor name'];
    state.superEmail = employee.fields['Supervisor email'];
    console.log(state.name, state.workEmail, state.firstName, state.division, state.supervisor, state.superEmail);

    if (activeDivisions.includes(employee.fields.Division)) {
      return send(
        fields(
          field('from', 'womenforwomen@irc.openfn.org'), //TODO: replace with WfW domain
          field('to', 'MAverbuj@womenforwomen.org'), //TODO: replace with L30
          field('cc', 'aleksa@openfn.org, jed@openfn.org'), //TODO: replace with L31
          //field('to', `${state.superEmail}`), //TODO: use when ready to send TO Division contact
          //field('cc', `${divisionEmailMap[employee.fields.Division]}`), //TODO: use when ready to copy Division contactk
          field('subject', state => {
            var sub = `New Account for: ${state.name} (${state.division})`;
            console.log(sub);
            return sub;
          }),
          field('html', state => {
            //WfW email template for notifying supervisors of new employee setup
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
<td style="font-family:Calibri, Arial, sans-serif;font-size:15px;padding:20px;padding-top:10px;line-height:1.5;" id="body">
<p>Dear supervisor,<br/><br/>We have setup the new account for  ${state.name} and we have emailed  ${state.workEmail} instructions to get started.<br/><br/>Please, make sure to welcome ${state.firstName} on Teams by <a href="https://teams.microsoft.com/l/chat/0/0?users=${state.workEmail}" style="font-weight:bold;color:#708090;text-decoration:none">clicking here</a>.</p>
<p>If you have any questions, do not hesitate to contact our Helpdesk Team via <a href="https://help.womenforwomen.org" style="font-weight:bold;color:#708090;text-decoration:none">live chat</a> or by email to <a href="mailto:helpdesk@womenforwomen.org" style="font-weight:bold;color:#708090;text-decoration:none">helpdesk@womenforwomen.org</a>.</p>
<p>Regards,<br/><br/>
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
