list('/');

fn(state => {
  const fileNames = [
    'wfwi Card Master',
    'wfwi Direct Debits',
    'wfwi Transactions - Cards',
    'wfwi Transactions - DD',
    'wfwi Custom CC Fields',
    'wfwi Custom DD Fields',
  ];
  console.log('Files to sync: ', fileNames);
  const today = new Date();
  const yesterdayFiles = state.data
    .filter(file => fileNames.some(s => file.name.includes(s)) && file.name.split('.')[1] === 'csv')
    .map(file => {
      const inputDate = file.name.split('.')[0].match(/\d+$/);

      if (inputDate !== null) {
        const year = inputDate[0].substring(0, 4);
        const month = inputDate[0].substring(4, 6);
        const day = inputDate[0].substring(6, 8);

        const dateObj = new Date(`${year}-${month}-${day}`);

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1); // set the date to yesterday

        // check for yesterday files only
        return dateObj.toDateString() === yesterday.toDateString() ? file : [];
      }

      return [];
    })
    .flat();

  if (yesterdayFiles.length === 0) console.log('No new CSV files found.');

  return { ...state, yesterdayFiles };
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
