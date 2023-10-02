fn(state => {
  return list('/')(state).then(state => {
    const partialFilenames = [
      // 'wfwi Donors 20230929',
      // 'wfwi Donors 20230930',
      // 'wfwi Donors 20231001',
      'wfwi Card Master 20230929',
      'wfwi Direct Debits 20230929',
      'wfwi Transactions - Cards 20230929',
      'wfwi Transactions - DD 20230929',
      'wfwi Custom CC Fields 20230929', 
      'wfwi Custom DD Fields 20230929', 
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

      // TODO What does this code below do ?
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

      const jsonSets = chunk(json, 50); // chunking into arrays of 50 objects

      console.log(jsonSets.length, 'sets.');

      const fileChunks = jsonSets.map(sets => ({
        fileName,
        fileType,
        json: sets,
        uploadDate: new Date(data.modifyTime).toISOString(),
        //dataset: 'testing',
        dataset: fileType.substring(0, fileType.length - 9),
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
      return { configuration, references: [], data: {} };
    });
  })
);
