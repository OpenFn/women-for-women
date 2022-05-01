fn(state => {
  const { error } = state;

  const start = error.findIndex(line => line == 'Duplicate rows detected in Committed Giving:') + 1;
  const end = error.findIndex(line => line == 'End of duplicates rows.');
  const duplicateEmails = error.slice(start, end);

  console.log('duplicatEmails', duplicateEmails);
  return { ...state, duplicateEmails };
});

send(state => ({
  from: 'WfWI Notifications <notifications@womenforwomen.org>',
  // 'h:Reply-To': 'aleksa@openfn.org',
  sender: 'WfWI Notifications',
  to: 'LGreening@womenforwomen.org, rmustakova@womenforwomen.org, jvieyres@womenforwomen.org',
  cc: 'aleksa@openfn.org',
  subject: 'Committed Giving Data Sync: Duplicate donors detected',
  html: `Dear admins, <br/><br/>
    Duplicate donors were detected in the latest Committed Giving export. Please review the duplicates in Committed Giving to merge the records.
          <br/><br/>
    Error: Potential duplicate rows detected in Committed Giving. See rows: ${JSON.stringify(
      state.duplicateEmails || [],
      null,
      2
    )}
          <br/><br/>
          Contact OpenFn at <a href='mailto:support@openfn.org'>support@openfn.org</a> with any questions.`,
}));