list('/');

// pluck the latest CSV file
fn(state => {
  const fileNames = 'wfwi donors';
  console.log('Files to sync: ', fileNames);

  const fileSubmissionDates = state.data
    .filter(file => file.name.split('.')[0].toLowerCase().includes(fileNames) && file.name.split('.')[1] === 'csv')
    .map(file => {
      const inputDate = file.name.split('.')[0].match(/\d+$/);

      if (inputDate !== null) {
        const year = inputDate[0].substring(0, 4);
        const month = inputDate[0].substring(4, 6);
        const day = inputDate[0].substring(6, 8);

        const dateObj = new Date(`${year}-${month}-${day}`);

        return isNaN(dateObj) ? [] : { input: inputDate[0], formatted: dateObj.toISOString().substring(0, 10) };
      }
      return [];
    })
    .flat();

  if (fileSubmissionDates.length === 0) {
    console.log('No new CSV files found.');
    return { ...state, latestFile: [] };
  } else {
    const latestFileDate = new Date(
      Math.max.apply(
        null,
        fileSubmissionDates.map(date => Date.parse(date.formatted))
      )
    );

    const latestInputDate = fileSubmissionDates.filter(
      date => date.formatted === latestFileDate.toISOString().substring(0, 10)
    )[0].input;

    const latestFile = state.data.filter(
      file => file.name.split('.')[0].toLowerCase().includes(latestInputDate) && file.name.split('.')[1] === 'csv'
    );

    // console.log('submission dates', fileSubmissionDates);
    // console.log('latest date', latestInputDate);
    // console.log('latest file', latestFile);

    return { ...state, latestFile };
  }
});

each(
  '$.latestFile[*]',
  fn(state => {
    const { configuration, data } = state;

    const chunk = (arr, chunkSize) => {
      var R = [];
      for (var i = 0, len = arr.length; i < len; i += chunkSize) R.push(arr.slice(i, i + chunkSize));
      return R;
    };

    const toLowerCase = string => {
      return string ? string.toLowerCase() : '';
    };

    return getCSV(`/${data.name}`)(state).then(async state => {
      const splitName = data.name.split('.');
      console.log(state.data.length);
      let json = [];
      let headers = state.data[0].split(',');
      headers = headers.map(h => (h = h.replace(/"/g, '')));

      state.data.slice(1).forEach(data => {
        // let row = data.split(',');
        let row = data.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);

        let obj = {};
        for (let j = 0; j < row.length; j++) {
          obj[headers[j]] = row[j].replace(/"/g, '');
        }
        json.push(obj);
      });

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

      json = [];

      const jsonSets = chunk(filteredJson, 50); // chunking into arrays of 50 objects; need smaller Contact batch sizes

      console.log(jsonSets.length, 'sets.');

      const type =
        data.name.includes('Extract') === true
          ? 'extract'
          : data.name.includes('Component') === true
          ? 'component'
          : splitName[0];

      const fileChunks = [];
      jsonSets.forEach(sets => {
        const fileContent = {
          fileName: data.name,
          fileType: type,
          json: sets,
          uploadDate: new Date(data.modifyTime).toISOString(),
          upload: '07042022',
        };
        fileChunks.push(fileContent);
      });

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
        duplicates.map(d => console.log(d));
        console.log('End of duplicates rows.');
        throw new Error(`Aborting run; duplicates detected.`);
      }
      return { configuration, references: [], data: {} };
    });
  })
);
