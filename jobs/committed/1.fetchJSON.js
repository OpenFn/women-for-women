alterState(state => {
  return list('/')(state).then(state => {
    const partialFilenames = [
      'wfwi Card Master 20230327',
      'wfwi Direct Debits 20230327',
      'wfwi Transactions - Cards 20230327',
      'wfwi Transactions - DD 20230327',
      'wfwi Custom CC Fields 20230327',
      'wfwi Custom DD Fields 20230327',
    ];
    console.log('Files to sync: ', partialFilenames);

    const files = state.data.filter(
      file => partialFilenames.some(s => file.name.includes(s)) && file.name.split('.')[1] === 'csv'
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
        let row = data.split(',');

        let obj = {};
        for (let j = 0; j < row.length; j++) {
          obj[headers[j]] = row[j].replace(/"/g, '');
        }

        if (!Object.values(obj).every(v => !v)) {
          // Note, we don't push objects into the array if all their values are
          // empty strings or otherwise falsy.
          json.push(obj);
        }
      });

      for (i = 0; i < json.length - 1; i++) {
        let index = [];
        for (j = i + 1; j < json.length; j++) {
          console;
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
          upload: '18022022',
        };
        fileChunks.push(fileContent);
      });

      // const fileContent = {
      //   fileName: data.name,
      //   fileType: type,
      //   json,
      //   uploadDate: new Date(data.modifyTime).toISOString(),
      // };
      // console.log('fileContent', fileContent);
      // return state;

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
