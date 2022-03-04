fn(state => {
  const error = state.error;
  let errorLine = '';
  error.forEach(line => {
    if (line.includes('Potential duplicate')) {
      errorLine = line;
    }
  });
  return { ...state, errorLine };
});

send(state =>
  fields(
    field('from', 'WfWI Notifications <notifications@womenforwomen.org>'),
    field('sender', 'WfWI Notifications'),
    //field('h:Reply-To', 'aleksa@openfn.org'),
    field('to', `LGreening@womenforwomen.org, rmustakova@womenforwomen.org, jvieyres@womenforwomen.org`), 
    field('cc', 'aleksa@openfn.org'),
    field('subject', 'Committed Giving Data Sync: Duplicate donors detected'),
    field(
      'html',
      `Dear WfWI Donation team, <br><br>
			Duplicate donors were detected in the latest Committed Giving export. Please review the duplicates in Committed Giving to merge the records.
            <br><br>
		    ${state.errorLine}
            <br><br>
            Contact OpenFn at support@openfn.org with any questions.`
    )
  )
);
