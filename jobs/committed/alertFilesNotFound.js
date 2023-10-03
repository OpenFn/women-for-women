fn(state => {
  const { missingDate, missingFiles } = state.data;

  const cc = 'aleksa@openfn.org';
  const replyTo = 'mtuchi@openfn.org';
  const to = 'aissatou@openfn.org, mtuchi@openfn.org';

  const email = {
    from: 'WfWI Notifications <notifications@womenforwomen.org>',
    'h:Reply-To': replyTo,
    sender: 'WfWI Notifications',
    to,
    cc,
    subject: 'Committed Giving Data Sync: No file found',
    html: `Dear admins, <br/><br/> Committed Giving file exports may have NOT been uploaded to the SFTP server for date ${missingDate}. The missing files are: <b>${missingFiles.join(
      ','
    )}</b>.
   Please review the sftp server and upload any missing CSV exports. Contact OpenFn at <a href='mailto:support@openfn.org'>support@openfn.org</a> with any questions.`,
  };

  return { ...state, email };
});

send(state => state.email);