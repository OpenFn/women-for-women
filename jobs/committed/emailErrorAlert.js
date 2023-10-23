fn(state => {
  const { duplicates } = state.data;

  console.log('duplicates', duplicates);
  return { ...state, duplicates };
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
      state.duplicates || [],
      null,
      2
    )}
          <br/><br/>
          Contact OpenFn at <a href='mailto:support@openfn.org'>support@openfn.org</a> with any questions.`,
}));
