send(
  fields(
    field("from", "WfWI Notifications <notifications@womenforwomen.org>"),
    field("sender", "WfWI Notifications"),
    field("h:Reply-To", "aleksa@openfn.org"),
    field("to", "aleksa@openfn.org"), //TODO: update recipients
    //field('cc', 'aleksa@openfn.org'),
    field("subject", "Committed Giving Sync: Duplicate Donors Detected"),
    field(
      "html",
      `Dear admins, <br><br> 
			Duplicate donors were detected in the latest Committed Giving export. Please review the duplicates in Committed Giving to merge the records:
            <br>
		    ${errorMessageFromParentJob}
            <br><br> 
            Contact OpenFn at support@openfn.org with any questions.`
    )
  )
);
