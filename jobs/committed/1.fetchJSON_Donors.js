alterState(state => {
  return list('/')(state).then(state => {
    const fileNames = ['wfwi donors 10122021'];
    console.log('Files to sync: ', fileNames);

    const files = state.data.filter(
      file => fileNames.includes(file.name.split('.')[0].toLowerCase()) && file.name.split('.')[1] === 'csv'
    );

    if (files.length === 0) console.log('No new CSV files found.');

    return { ...state, files };
  });
});

each(
  '$.files[*]',
  alterState(state => {
    const { configuration, data } = state;

    const chunk = (arr, chunkSize) => {
      var R = [];
      for (var i = 0, len = arr.length; i < len; i += chunkSize) R.push(arr.slice(i, i + chunkSize));
      return R;
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

      const filteredJson = json.filter(
        js => js['EmailAddress'] && !duplicates.includes(js['EmailAddress'].toLowerCase())
      );

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
          upload: '17-12-2021', 
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
        throw new Error(
          `Potential duplicate rows detected in Committed Giving. See rows: ${JSON.stringify(duplicates, null, 2)}`
        );
      }
      return { configuration, references: [], data: {} };
    });
  })
);
