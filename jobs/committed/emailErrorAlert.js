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
    field('h:Reply-To', 'mamadou@openfn.org'),
    field('to', 'mamadou@openfn.org'), //TODO: update recipients
    //field('cc', 'aleksa@openfn.org'),
    field('subject', 'Committed Giving Sync: Duplicate Donors Detected'),
    field(
      'html',
      `Dear admins, <br><br>
			Duplicate donors were detected in the latest Committed Giving export. Please review the duplicates in Committed Giving to merge the records:
            <br>
		    ${state.errorLine}
            <br><br>
            Contact OpenFn at support@openfn.org with any questions.`
    )
  )
);
