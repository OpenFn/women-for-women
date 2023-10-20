fn(state => {
  const fileNames = ['wfwi Donors'];

  // Get today's date in the "yyyyMMdd" format
  const today = new Date();
  const todayDate = today.toISOString().slice(0, 10).replace(/-/g, '');

  return list(
    '/',
    file => {
      const fileName = file.name;
      const containsSpecifiedName = fileName && fileNames.some(name => fileName.includes(name));
      const containTodayDate = fileName && fileName.includes(todayDate);

      return containsSpecifiedName && containTodayDate;
    },
    state => {
      // pluck the latest CSV file
      const latestFiles = state.data;
      if (latestFiles.length === 0) console.log('No CSV files found, Will send alert email shortly');

      const foundFiles = latestFiles.map(file => file.name.replace(/\s\d{8}\.csv/, ''));
      const missingFiles = fileNames.filter(fileName => !foundFiles.includes(fileName));

      return { ...state, data: {}, latestFiles, missingFiles, today, todayDate };
    }
  )(state);
});

fn(state => {
  const { missingFiles, today } = state;

  if (missingFiles.length > 0) {
    const url = state.configuration.openfnInboxUrl;
    const data = {
      missingFiles,
      missingDate: today.toISOString().slice(0, 10),
      runStartDate: today.toISOString(),
      notificationType: 'missing-files',
    };
    console.log('The following files are missing for', today.toISOString());
    console.log(JSON.stringify(missingFiles, null, 2));

    return http
      .post({ url, data })(state)
      .then(() => {
        console.log(`Posted missing to OpenFn Inbox.\n`);
        return { ...state, references: [], data: {}, missingFiles: [] };
      });
  }
  return state;
});

each(
  '$.latestFiles[*]',
  fn(state => {
    const { configuration, data } = state;

    const fileName = data.name;
    let fileType;
    switch (true) {
      case fileName.includes('Extract'):
        fileType = 'extract';
        break;
      case fileName.includes('Component'):
        fileType = 'component';
        break;
      default:
        fileType = fileName.split('.')[0];
    }

    const toLowerCase = string => {
      return string ? string.toLowerCase() : '';
    };

    return getCSV(`/${data.name}`, { flatKeys: true })(state).then(async state => {
      let json = state.data;

      const duplicates = [];
      for (let i = 0; i < json.length; i++) {
        for (let j = i + 1; j < json.length; j++) {
          if (json[i]['EmailAddress'] && json[j]['EmailAddress']) {
            if (json[i]['EmailAddress'].toLowerCase() === json[j]['EmailAddress'].toLowerCase()) {
              let email = json[i]['EmailAddress'].toLowerCase();
              if (!duplicates.includes(email)) duplicates.push(email);
            }
          }
        }
      }

      const filteredJson = json.filter(js => !duplicates.includes(toLowerCase(js['EmailAddress'])));

      const jsonSets = chunk(filteredJson, 50); // chunking into arrays of 50 objects; need smaller Contact batch sizes

      console.log(jsonSets.length, 'sets.');

      const fileChunks = jsonSets.map(sets => ({
        fileName,
        fileType,
        json: sets,
        uploadDate: new Date(data.modifyTime).toISOString(),
        dataset: 'wfwi Donors',
      }));

      let countInbox = 0;
      const postToInbox = async data => {
        countInbox++;
        console.log(`${countInbox} request to inbox`);

        await new Promise(resolve => setTimeout(resolve, 2000));
        await http.post({
          url: configuration.openfnInboxUrl,
          data,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        })(state);
      };

      for (const file of fileChunks) {
        await postToInbox(file);
      }

      if (duplicates.length > 0) {
        console.log('Duplicate rows detected in Committed Giving:');
        duplicates.forEach(d => console.log(d));
        console.log('End of duplicates rows.');

        throw new Error(`Aborting run; duplicates detected.`);
      }
      return { configuration, references: [], data: {} };
    });
  })
);
