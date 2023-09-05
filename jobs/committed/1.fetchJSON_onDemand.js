1alterState(state => {
  return list('/')(state).then(state => {
    const partialFilenames = [
      'wfwi Donors 20230831',
      // 'wfwi Donors 20230822',
      // 'wfwi Donors 20230823',
      // 'wfwi Donors 20230824',
      // 'wfwi Donors 20230825',
      // 'wfwi Donors 20230826',
      // 'wfwi Donors 20230827',
      // 'wfwi Donors 20230828',
      // 'wfwi Donors 20230829',
      // 'wfwi Donors 20230830',
      // 'wfwi Donors 20230831',
      // 'wfwi Donors 20230901',
      // 'wfwi Donors 20230902',
      // 'wfwi Donors 20230903',
      // 'wfwi Donors 20230904',
      // 'wfwi Card Master 20230822',
      // 'wfwi Card Master 20230823',
      // 'wfwi Card Master 20230824',
      // 'wfwi Card Master 20230825',
      // 'wfwi Card Master 20230826',
      // 'wfwi Card Master 20230827',
      // 'wfwi Card Master 20230828',
      // 'wfwi Card Master 20230829',
      // 'wfwi Card Master 20230830',
      // 'wfwi Card Master 20230831',
      // 'wfwi Card Master 20230901',
      // 'wfwi Card Master 20230902',
      // 'wfwi Card Master 20230903',
      // 'wfwi Card Master 20230904',
      // 'wfwi Direct Debits 20230822',
      // 'wfwi Direct Debits 20230823',
      // 'wfwi Direct Debits 20230824',
      // 'wfwi Direct Debits 20230825',
      // 'wfwi Direct Debits 20230826',
      // 'wfwi Direct Debits 20230827',
      // 'wfwi Direct Debits 20230828',
      // 'wfwi Direct Debits 20230829',
      // 'wfwi Direct Debits 20230830',
      // 'wfwi Direct Debits 20230831',
      // 'wfwi Direct Debits 20230901',
      // 'wfwi Direct Debits 20230902',
      // 'wfwi Direct Debits 20230903',
      // 'wfwi Direct Debits 20230904',
      // 'wfwi Transactions - Cards 20230822',
      // 'wfwi Transactions - Cards 20230823',
      // 'wfwi Transactions - Cards 20230824',
      // 'wfwi Transactions - Cards 20230825',
      // 'wfwi Transactions - Cards 20230826',
      // 'wfwi Transactions - Cards 20230827',
      // 'wfwi Transactions - Cards 20230828',
      // 'wfwi Transactions - Cards 20230829',
      // 'wfwi Transactions - Cards 20230830',
      // 'wfwi Transactions - Cards 20230831',
      // 'wfwi Transactions - Cards 20230901',
      // 'wfwi Transactions - Cards 20230902',
      // 'wfwi Transactions - Cards 20230903',
      // 'wfwi Transactions - Cards 20230904',
      // 'wfwi Custom CC Fields 20230822',
      // 'wfwi Custom CC Fields 20230823',
      // 'wfwi Custom CC Fields 20230824',
      // 'wfwi Custom CC Fields 20230825',
      // 'wfwi Custom CC Fields 20230826',
      // 'wfwi Custom CC Fields 20230827',
      // 'wfwi Custom CC Fields 20230828',
      // 'wfwi Custom CC Fields 20230829',
      // 'wfwi Custom CC Fields 20230830',
      // 'wfwi Custom CC Fields 20230831',
      // 'wfwi Custom CC Fields 20230901',
      // 'wfwi Custom CC Fields 20230902',
      // 'wfwi Custom CC Fields 20230903',
      // 'wfwi Custom CC Fields 20230904',
      // 'wfwi Custom DD Fields 20230822',
      // 'wfwi Custom DD Fields 20230823',
      // 'wfwi Custom DD Fields 20230824',
      // 'wfwi Custom DD Fields 20230825',
      // 'wfwi Custom DD Fields 20230826',
      // 'wfwi Custom DD Fields 20230827',
      // 'wfwi Custom DD Fields 20230828',
      // 'wfwi Custom DD Fields 20230829',
      // 'wfwi Custom DD Fields 20230830',
      // 'wfwi Custom DD Fields 20230831',
      // 'wfwi Custom DD Fields 20230901',
      // 'wfwi Custom DD Fields 20230902',
      // 'wfwi Custom DD Fields 20230903',
      // 'wfwi Custom DD Fields 20230904',
      // 'wfwi Transactions - DD 20230822.csv', 
      // 'wfwi Transactions - DD 20230823.csv',
      // 'wfwi Transactions - DD 20230824.csv',
      // 'wfwi Transactions - DD 20230825.csv',  
      // 'wfwi Transactions - DD 20230826.csv',
      // 'wfwi Transactions - DD 20230827.csv', 
      // 'wfwi Transactions - DD 20230828.csv',
      // 'wfwi Transactions - DD 20230829.csv',
      // 'wfwi Transactions - DD 20230830.csv',
      // 'wfwi Transactions - DD 20230831.csv',
      // 'wfwi Transactions - DD 20230901.csv',
      // 'wfwi Transactions - DD 20230902.csv',
      // 'wfwi Transactions - DD 20230903.csv',
      // 'wfwi Transactions - DD 20230904.csv'
      // 'wfwi Card Master 20230820',
      // 'wfwi Direct Debits 20230820',
      // 'wfwi Transactions - Cards 20230820',
      // 'wfwi Transactions - DD 20230820',
      // 'wfwi Custom CC Fields 20230820',
      // 'wfwi Custom DD Fields 20230820',
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
          dataset: type.substring(0, type.length - 9),
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
