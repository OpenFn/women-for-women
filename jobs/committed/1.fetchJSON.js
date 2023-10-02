fn(state => {
  const fileNames = [
    'wfwi Card Master',
    'wfwi Direct Debits',
    'wfwi Transactions - Cards',
    'wfwi Transactions - DD',
    'wfwi Custom CC Fields',
    'wfwi Custom DD Fields',
  ];

  // Get today's date in the "yyyyMMdd" format
  const today = new Date();
  const todayDate = today.toISOString().slice(0, 10).replace(/-/g, '');

  // Calculate yesterday's date
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().slice(0, 10).replace(/-/g, '');

  return list(
    '/',
    file => {
      const fileName = file.name;
      const containsSpecifiedName = fileName && fileNames.some(name => fileName.includes(name));
      const containYesterdayDate = fileName && fileName.includes(yesterdayDate);
      // Files contain todays date
      // const containTodayDate = fileName && fileName.includes(todayDate);

      return containsSpecifiedName && containYesterdayDate;
    },
    state => {
      const yesterdayFiles = state.data;
      if (yesterdayFiles.length === 0) console.log('No CSV files found, Will send alert email shortly');

      const foundFiles = yesterdayFiles.map(file => file.name.replace(/\s\d{8}\.csv/, ''));
      const missingFiles = fileNames.filter(fileName => !foundFiles.includes(fileName));

      return {
        ...state,
        data: {},
        yesterdayFiles,
        missingFiles,
        today,
        yesterday,
        todayDate,
        yesterdayDate,
        fileNames,
      };
    }
  )(state);
});

fn(state => {
  const { missingFiles, yesterdayDate, today, yesterday } = state;

  if (missingFiles.length > 0) {
    const url = state.configuration.openfnInboxUrl;
    const data = {
      missingFiles,
      missingDate: yesterday.toISOString().slice(0, 10),
      runStartDate: today.toISOString(),
      notificationType: 'missing-files',
    };
    console.log('The following files are missing for', yesterdayDate);
    console.log(JSON.stringify(missingFiles, null, 2));

    return http
      .post({ url, data })(state)
      .then(() => {
        console.log(`Posted missing to OpenFn Inbox.\n`);
        return { ...state, references: [], data: {} };
      });
  }
  return state;
});

each(
  '$.yesterdayFiles[*]',
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

    return getCSV(`/${fileName}`, { flatKeys: true })(state).then(async state => {
      let json = state.data;

      // TODO what does this code do?
      for (let i = 0; i < json.length - 1; i++) {
        let index = [];
        for (let j = i + 1; j < json.length; j++) {
          if (json[i]['EmailAddress'] && json[j]['EmailAddress']) {
            if (json[i]['EmailAddress'].toLowerCase() === json[j]['EmailAddress'].toLowerCase()) {
              index.push(j);
            }
          }
        }
        if (index.length > 0) {
          index.forEach((ind, k) => {
            json[ind]['EmailAddress'] = `${json[ind]['EmailAddress']}up${k + 1}`;
          });
        }
      }

      const jsonSets = chunk(json, 50); // chunking into arrays of 1000 objects

      console.log(jsonSets.length, 'sets.');

      const fileChunks = jsonSets.map(sets => ({
        fileName,
        fileType,
        json: sets,
        uploadDate: new Date(data.modifyTime).toISOString(),
        dataset: fileType.substring(0, fileType.length - 9),
      }));

      let countInbox = 0;
      const postToInbox = async data => {
        countInbox++;
        console.log(`${countInbox} request to inbox`);

        await new Promise(resolve => setTimeout(resolve, 2000));
        // return state;
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
      return { configuration, references: [], data: {} };

      // return http
      //   .post({
      //     url: configuration.openfnInboxUrl,
      //     data: fileContent,
      //     maxContentLength: Infinity,
      //     maxBodyLength: Infinity,
      //   })(state)
      //   .then(() => {
      //     console.log(`Posted ${data.name} to OpenFn Inbox.\n`);
      //     return { configuration, references: [], data: {} };
      //   });
    });
  })
);
