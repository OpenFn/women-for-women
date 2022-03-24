send(state => {
  const { error } = state;
  const { text, duplicates } = error || {};
  return fields(
    field('from', 'WfWI Notifications <notifications@womenforwomen.org>'),
    field('sender', 'WfWI Notifications'),
    //field('h:Reply-To', 'aleksa@openfn.org'),
    field('to', `emeka@openfn.org`),
    field('cc', 'aleksa@openfn.org'),
    field('subject', 'Committed Giving Data Sync: Duplicate donors detected'),
    field(
      'html',
      `Dear admins, <br/><br/>
      Duplicate donors were detected in the latest Committed Giving export. Please review the duplicates in Committed Giving to merge the records. 
            <br/><br/>
		    Error: ${text} ${JSON.stringify(duplicates, null, 2)}
            <br/><br/>
            Contact OpenFn at <a href='mailto:support@openfn.org'>support@openfn.org</a> with any questions.`
    )
  );
});
