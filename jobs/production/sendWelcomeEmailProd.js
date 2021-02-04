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
    state.firstName = employee.fields['First Name'];
    state.name = employee.fields['First name Last name'];
    console.log(state.name, state.workEmail);

    if (activeDivisions.includes(employee.fields.Division)) {
      return send(
        fields(
          field('from', 'womenforwomen@irc.openfn.org'), 
          field('to', 'MAverbujA@womenforwomen.org'), //FOR TESTING
          //field('cc', 'aleksa@openfn.org, jed@openfn.org'), //FOR TESTING
          //field('to', `${state.workEmail}`), //TODO: use when ready to send TO employee
          //field('cc', `${divisionEmailMap[employee.fields.Division]}`), //TODO: use when ready to copy Division contact
          field('subject', state => {
            var sub = `Welcome to Women for Women International, ${state.name}!`;
            console.log(sub);
            return sub;
          }),
          field('html', state => {
            var msg = 

//WfW welcome template


`<!--[if !mso]><!-->
    <link href="https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <!--<![endif]-->

    <!--[if gte mso 9]>
	<style type="text/css" media="all">
		sup { font-size: 100% !important; }
	</style>
	<![endif]-->


    <style type="text/css" media="screen">
        /* Linked Styles */
        
        body {
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            min-width: 100% !important;
            width: 100% !important;
            background: #eeeeee;
            -webkit-text-size-adjust: none
        }
        
        a {
            color: #4e54cb;
            text-decoration: none
        }
        
        p {
            padding: 0 !important;
            margin: 0 !important
        }
        
        img {
            -ms-interpolation-mode: bicubic;
            /* Allow smoother rendering of resized image in Internet Explorer */
        }
        
        .mcnPreviewText {
            display: none !important;
        }
        
        .text-footer a {
            color: #7e7e7e !important;
        }
        
        .text-footer2 a {
            color: #c3c3c3 !important;
        }
        /* Mobile styles */
        
        @media only screen and (max-device-width: 480px),
        only screen and (max-width: 480px) {
            .mobile-shell {
                width: 100% !important;
                min-width: 100% !important;
            }
            .m-center {
                text-align: center !important;
            }
            .m-left {
                margin-right: auto !important;
            }
            .center {
                margin: 0 auto !important;
            }
            .td {
                width: 100% !important;
                min-width: 100% !important;
            }
            .m-br-15 {
                height: 15px !important;
            }
            .m-separator {
                border-bottom: 1px solid #000000;
            }
            .small-separator {
                border-top: 1px solid #333333 !important;
                padding-bottom: 20px !important;
            }
            .m-td,
            .m-hide {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
                font-size: 0 !important;
                line-height: 0 !important;
                min-height: 0 !important;
            }
            .m-block {
                display: block !important;
            }
            .fluid-img img {
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
            }
            .content-middle {
                width: 140px !important;
                padding: 0px !important;
            }
            .text-white {
                font-size: 16px !important;
            }
            .h2-white {
                font-size: 46px !important;
                line-height: 50px !important;
            }
            .h3-white {
                font-size: 24px !important;
                line-height: 30px !important;
            }
            .mpb15 {
                padding-bottom: 15px;
            }
            .content {
                padding: 20px 15px !important;
            }
            .section-inner {
                padding: 0px !important;
            }
            .content-2 {
                padding: 30px 15px 30px 15px !important;
            }
            .pt30 {
                padding-top: 20px !important;
            }
            .p30-15 {
                padding: 30px 15px !important;
            }
            .footer {
                padding: 30px 15px !important;
            }
            .main {
                padding: 0px !important;
            }
            .section {
                padding: 30px 15px 30px 15px !important;
            }
            .section2 {
                padding: 0px 15px 30px 15px !important;
            }
            .section4 {
                padding: 30px 15px !important;
            }
            .section-inner2 {
                padding: 30px 15px !important;
            }
            .separator-outer {
                padding-bottom: 30px !important;
            }
            .section3 {
                padding: 30px 15px !important;
            }
            .mpb10 {
                padding-bottom: 10px !important;
                padding-top: 5px !important;
            }
            .preheader {
                padding-bottom: 20px !important;
            }
            .column,
            .column-dir,
            .column-top,
            .column-empty,
            .column-empty2,
            .column-bottom,
            .column-dir-top,
            .column-dir-bottom {
                float: left !important;
                width: 100% !important;
                display: block !important;
            }
            .column-empty {
                padding-bottom: 30px !important;
            }
            .column-empty2 {
                padding-bottom: 10px !important;
            }
            .content-spacing {
                width: 15px !important;
            }
        }
    </style>
</head>

<body class="body" style="padding:0 !important; margin:0 !important; display:block !important; min-width:100% !important; width:100% !important; background:#eeeeee; -webkit-text-size-adjust:none;">
    <!--*|IF:MC_PREVIEW_TEXT|*-->
    <!--[if !gte mso 9]><!-->
    <span class="mcnPreviewText" style="display:none; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; visibility:hidden; mso-hide:all;"></span>
    <!--<![endif]-->
    <!--*|END:IF|*-->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#eeeeee">
        <tr>
            <td align="center" valign="top">
                <!-- Main -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td align="center">
                            <table width="700" border="0" cellspacing="0" cellpadding="0" class="mobile-shell">
                                <tr>
                                    <td class="td" style="width:700px; min-width:700px; font-size:0pt; line-height:0pt; padding:0; margin:0; font-weight:normal;">


                                        <!-- Header -->
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff">
                                            <tr>
                                                <td style="padding: 30px 0px 30px 0px;">
                                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                        <tr>
                                                            <td class="img m-center " style="font-size:0pt; line-height:0pt; text-align:center;"><img src="https://us05.rocketseed.com/img/2112" width="250" mc:edit="image_2" style="max-width:250px;" border="0" alt="" /></td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        <!-- <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#2f8081"> -->
                                            <!-- <tr> -->
                                                <!-- <td class="img m-center mpb10" style="font-size:0pt; line-height:0pt; text-align:center;"><img src="https://i.ibb.co/xMjbnRT/bannerr.png" width="100%" mc:edit="image_2" style="max-width:700px;" border="0" alt="" /></td> -->
                                            <!-- </tr> -->
                                        <!-- </table> -->
                                        <!-- END Header -->
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff">
                                            <tr>
                                                <td class="content" style="padding:30px 30px;">
                                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                        <tr>
                                                            <td class="text-white left pb15" style="color:#000000; font-family:'Mulish', Calibri, Arial, sans-serif; font-size:18px; line-height:20px;  text-align:left; padding-bottom:15px;">
                                                                <strong>DEAR ${STATE.FIRSTNAME},</strong>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td class="text-white left pb15" style="color:#000000; font-family:'Mulish', Calibri, Arial, sans-serif; font-size:18px; line-height:20px;  text-align:left; padding-bottom:15px;">
                                                                This email will help you get your new @womenforwomen.org account ready so you can start accessing the resources you need to begin communicating and collaborating with everyone in the organization.
                                                            <br></br></td>
                                                        </tr>
                                                        <tr>
                                                            <td class="text-white left pb15" style="color:#000000; font-family:'Mulish', Calibri, Arial, sans-serif; font-size:18px; line-height:20px;  text-align:left; padding-bottom:15px;">
                                                                Following are your temporary credentials to get started and further down you will find links to get into your new Outlook and Teams account.
                                                            <br></br></td>
                                                        </tr>
                                                        <tr>
                                                            <td align="center" style="padding-top:20px; padding-bottom:30px;">
                                                                <table width="80%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F5B2AD">
                                                                    <tr>
                                                                        <td style="background:#F5B2AD; color:#ffffff; font-family:'Mulish', Calibri, Arial, sans-serif; padding-top:10px; padding-bottom:10px; font-size:22px; line-height:28px; text-align:center; ">
                                                                            <div mc:edit="text_cap">Temporary Credentials</div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                                <table width="80%" border="0" cellspacing="0" cellpadding="0" bgcolor="#00997b" style="padding:0px 8px; border-collapse:collapse; ">


                                                                    <tr>
                                                                        <th width="40%">

                                                                        </th>
                                                                        <th width="60%">

                                                                        </th>
                                                                    </tr>

                                                                    <tr>
                                                                        <td valign="middle" class="text4 left pb20" style="color:#2f2f2f;   background:#01C5AF; font-family:'Mulish', Calibri, Arial, sans-serif; font-size:18px; line-height:24px; text-align:left; padding:10px;;">
                                                                            <div mc:edit="text_name"> <strong>	Name: </strong></div>
                                                                        </td>
                                                                        <td valign="middle" class="text-white left pb20" style="color:#2f2f2f; background:#01C5AF;font-family:'Mulish', Calibri, Arial, sans-serif; font-size:18px; text-transform: capitalize; line-height:24px; text-align:left; padding:10px;;">
                                                                            ${state.name}
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td valign="middle" class="text4 left pb20" style="color:#2f2f2f; background:#018374; font-family:'Mulish', Calibri, Arial, sans-serif; font-size:18px; line-height:24px; text-align:left; padding:10px;;">
                                                                            <div mc:edit="text_email"> <strong>	Email:</strong></div>
                                                                        </td>
                                                                        <td valign="middle" class="text-white left pb20" style="color:#2f2f2f; background:#018374;font-family:'Mulish', Calibri, Arial, sans-serif; font-size:18px; text-transform: capitalize; line-height:24px; text-align:left; padding:10px;;">
                                                                            ${state.workEmail}
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td valign="middle" class="text4 left pb20" style="color:#2f2f2f; background:#01C5AF; font-family:'Mulish', Calibri, Arial, sans-serif; font-size:18px; line-height:24px; text-align:left; padding:10px;;">
                                                                            <div mc:edit="text_password"><strong>Temporary Password </strong></div>
                                                                        </td>
                                                                        <td valign="middle" class="text-white left pb20" style="color:#2f2f2f; background:#01C5AF;font-family:'Mulish', Calibri, Arial, sans-serif; font-size:18px;  line-height:24px; text-align:left; padding:10px;;">
                                                                            You'll Never Walk Alone!
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td valign="middle" class="text4 left pb20" style="color:#2f2f2f;background:#018374; font-family:'Mulish', Calibri, Arial, sans-serif; font-size:18px; line-height:24px; text-align:left; padding:10px;;">
                                                                            <div mc:edit="text_detail"> <strong>Change Password:</strong></div>
                                                                        </td>
                                                                        <td valign="middle" class="text-white left pb20" style="color:#ffffff; background:#018374;font-family:'Mulish', Calibri, Arial, sans-serif; font-size:18px;  line-height:24px; text-align:left; padding:10px;;">
                                                                            <a href="https://passwordreset.microsoftonline.com/?whr=womenforwomen.org" target="_blank" style="color:#ffffff; text-decoration:underline;"><span style="color:#ffffff; text-decoration:underline; "><strong>START HERE</strong></span></a>
                                                                        </td>
                                                                    </tr>

                                                                </table>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td class=" left pb15" style="color:#A32638; font-family:'Mulish', Calibri, Arial, sans-serif; font-size:18px; line-height:18px;  text-align:left; padding-bottom:15px;">
                                                                <br></br><strong>Important:</strong> The above password is your temporary logon to WfWI. You will be asked to change it to a new password and setup multi-factor authentication with your mobile device.
                                                                This temporary password will expire in 48 hours. <br></br>
                                                            </td>
                                                        </tr>
                                                        <!-- Button -->
                                                        <tr>
                                                            <td align="center"; style="padding-top:15px; padding-bottom:10px;">
                                                                <table width="400px" border="0" cellspacing="0" cellpadding="0">
                                                                    <tr>
                                                                        <th width="200px" style="font-size:0pt; line-height:0pt; padding:0; margin:0; font-weight:normal; vertical-align:center;">
                                                                            <table align="center"; width="100px" border="0" cellspacing="2" cellpadding="1">
                                                                                <tr>
                                                                                    <td class="text-button white-button" style="font-family:'Raleway', Arial,sans-serif; font-size:18px; line-height:22px; text-align:center; font-weight:bold;">
                                                                                        <div mc:edit="text_8">
                                                                                            <a href="https://outlook.office.com/" target="_blank" class="link" style="color:#4e54cb; text-decoration:none;"><img src="https://th.bing.com/th/id/R3f0d0825e77de5c16ad70889bbcf3b09?rik=0mn0qg2UL6TyLg&riu=http%3a%2f%2fwww.softsolutionworks.com%2fimages%2fOutlook%2fOutlook.png&ehk=ckhb0FzDr4Q4OTOfZ0848Uofgl2FHDJLGyCG5ETvls4%3d&risl=&pid=ImgRaw" width="150px" mc:edit="image_8" style="max-width:175px;" border="0" alt="" /></a>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>

                                                                            </table>
                                                                        </th>
                                                                        <th class="100px" style="font-size:0pt; line-height:0pt; padding:0; margin:0; font-weight:normal; vertical-align:center;">
                                                                            <table align="center"; width="200px" border="0" cellspacing="2" cellpadding="1">
                                                                                <tr>
                                                                                    <td class="text-button white-button" style="font-family:'Raleway', Arial,sans-serif; font-size:18px; line-height:22px; text-align:center; font-weight:bold;">
                                                                                        <div mc:edit="text_8">
                                                                                            <a href="https://aka.ms/mstfw" target="_blank" class="link" style="color:#4e54cb; text-decoration:none;">
                                                                                                <img src="https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE2Z7GW?ver=0ab9&q=90&m=2&h=768&w=1024&b=%23FFFFFFFF&aim=true" width="130px" height="75px" mc:edit="image_8" style="max-width:175px;" border="0" />
                                                                                            </a>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                        </th>
                                                                    </tr>
																	<tr>
																	<td class="text-white left pb15" style="color:#000000; font-family:'Mulish', Calibri, Arial, sans-serif; font-size:18px; line-height:20px;  text-align:center; padding-bottom:15px;">
                                                                Microsoft Outlook
                                                            </td>
															<td class="text-white left pb15" style="color:#000000; font-family:'Mulish', Calibri, Arial, sans-serif; font-size:18px; line-height:20px;  text-align:center; padding-bottom:15px;">
                                                                Microsoft Teams
                                                            </td>
																	</td>
																	</tr>
                                                                </table>
                                                            </td>
                                                        </tr>


                                                        <!-- END Button -->
                                                        <tr>
                                                            <td class="text-white left pb15" style="color:#000000; font-family:'Mulish', Calibri, Arial, sans-serif; font-size:18px; line-height:20px;  text-align:left; padding-bottom:25px;">
                                                                <br></br>If you have any questions, do not hesitate to contact our Helpdesk Team via
                                                                <a href="https://teams.microsoft.com/l/chat/0/0?users=maverbuj@womenforwomen.org,mmoisethomas@womenforwomen.org,cani@womenforwomen.org&topicName=NEW USER | Requesting Support&message=Welcome to Women for Women International! How can we help you?"> <target="_blank" style="color:#F55C40; text-decoration:underline;"><span style="color:#F55C40; text-decoration:underline;">live chat</span></a> or
                                                                by email to
                                                                <a href="mailto:helpdesk@womenforwomen.org" target="_blank" style="color:#F55C40; text-decoration:underline;"><span style="color:#F55C40; text-decoration:underline;">helpdesk@womenforwomen.org</span></a>.
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td class="text-white left pb15" style="color:#000000; font-family:'Mulish', Calibri, Arial, sans-serif; font-size:18px; line-height:20px;  text-align:left; padding-bottom:10px;">
                                                                We look forward to working with you! <br></br>
                                                            </td>
                                                        </tr>
														<tr>
                                                            <td class="text-white left pb15" style="color:#000000; font-family:'Mulish', Calibri, Arial, sans-serif; font-size:18px; line-height:20px;  text-align:left; padding-bottom:15px;">
                                                                IT@WfWI
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>


                                        <!-- Footer -->
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff">
                                            <tr>
                                                <td class="footer" style="padding:10px 20px 0px;">
                                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                        <tr>
                                                            <td class="social-title " style="color:#000000;font-family:'Mulish', Calibri, Arial, sans-serif; font-size:18px; line-height:22px; text-align:center; text-transform:uppercase; padding-bottom:20px;">
                                                                <div mc:edit="text_33">f o l l o w &nbsp; u s</div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td class="pb30" align="center" style="padding-bottom:20px;">
                                                                <table border="0" cellspacing="0" cellpadding="0">
                                                                    <tr>
                                                                        <td class="img" width="40" style="font-size:0pt; line-height:0pt; text-align:left;">
                                                                            <a href="https://www.instagram.com/womenforwomen/" target="_blank"><img src="https://i.ibb.co/59BQ3Wd/instagram.png" width="32" height="32" mc:edit="image_10" style="max-width:32px;" border="0" alt="" /></a>
                                                                        </td>

                                                                        <td class="img" width="40" style="font-size:0pt; line-height:0pt; text-align:left;">
                                                                            <a href="https://www.facebook.com/womenforwomen" target="_blank"><img src="https://i.ibb.co/xGJmDgD/facebook.png" width="32" height="32" mc:edit="image_10" style="max-width:32px;" border="0" alt="" /></a>
                                                                        </td>
                                                                        <td class="img" width="40" style="font-size:0pt; line-height:0pt; text-align:left;">
                                                                            <a href="https://www.linkedin.com/company/women-for-women-international/" target="_blank"><img src="https://i.ibb.co/BzyvWbv/linkedin.png" width="32" height="32" mc:edit="image_11" style="max-width:32px;" border="0" alt="" /></a>
                                                                        </td>
                                                                        <td class="img" width="40" style="font-size:0pt; line-height:0pt; text-align:left;">
                                                                            <a href="https://twitter.com/WomenforWomen" target="_blank"><img src="https://i.ibb.co/DWLmY7L/twitter.png" width="32" height="32" mc:edit="image_11" style="max-width:32px;" border="0" alt="" /></a>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>


                                                    </table>

                                                </td>
                                            </tr>

                                            <!-- <tr> -->
                                                <!-- <td class="text-footer " style="color:#ffffff; font-family:'Mulish', Calibri, Arial, sans-serif; font-size:16px; line-height:20px; padding:15px 0px; background:#018374; text-align:center"> -->
                                                    <!-- All Rights Reserved -->
                                                <!-- </td> -->
                                            <!-- </tr> -->
                                        </table>
                                        <!-- END Footer -->

                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <!-- END Main -->
            </td>
        </tr>
    </table>
</body>`;
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