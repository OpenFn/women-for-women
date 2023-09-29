send(state => ({
  from: 'WfWI Notifications <notifications@womenforwomen.org>',
  'h:Reply-To': 'aleksa@openfn.org',
  sender: 'WfWI Notifications',
  to: 'aissatou@openfn.org, mtuchi@openfn.org',
  cc: 'aleksa@openfn.org',
  subject: 'Committed Giving Data Sync: No file found',
  html: `Dear admins, <br/><br/> Committed Giving file exports may have NOT been uploaded to the SFTP server for date ${state.cursor}: <i>state.filesNotFound</i>
 Please review the sftp server and upload any missing CSV exports. Contact OpenFn at <a href='mailto:support@openfn.org'>support@openfn.org</a> with any questions.`,
}));
