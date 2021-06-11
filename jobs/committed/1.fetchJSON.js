alterState(state => {
  return list('/')(state).then(state => {
    const fileNames = [
      '20210517 wfwi donors',
      // '20210517 wfwi live sponsorships',
      // '20210517 wfwi card master',
      // '20210517 wfwi direct debits',
      //  '20210517 wfwi transactions - cards',
      //  '20210517 wfwi custom cc fields',
      // '20210517 wfwi custom dd fields',
      //  '20210517 wfwi transactions - dd',
    ];

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

    return getCSV(`/${data.name}`)(state).then(state => {
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
        json.push(obj);
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

      const type =
        data.name.includes('Extract') === true
          ? 'extract'
          : data.name.includes('Component') === true
          ? 'component'
          : splitName[0];

      const fileContent = {
        fileName: data.name,
        fileType: type,
        json,
        uploadDate: new Date(data.modifyTime).toISOString(),
      };
      // console.log('fileContent', fileContent);
      // return state;
      return http
        .post({
          url: configuration.openfnInboxUrl,
          data: fileContent,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        })(state)
        .then(() => {
          console.log(`Posted ${data.name} to OpenFn Inbox.\n`);
          return { configuration, references: [], data: {} };
        });
    });
  })
);
