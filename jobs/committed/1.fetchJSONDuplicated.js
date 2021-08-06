alterState(state => {
  return list('/')(state).then(state => {
    // prettier-ignore
    const fileNames = [
      // 'wfwi card master', 
      // 'wfwi transactions - cards',
      'wfwi transactions - dd'
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

    function reduceArray(array, groupBy) {
      return array.reduce((r, a) => {
        r[a[groupBy]] = r[a[groupBy]] || [];
        r[a[groupBy]].push(a);

        return r;
      }, Object.create(null));
    }

    const chunk = (arr, chunkSize) => {
      var R = [];
      for (var i = 0, len = arr.length; i < len; i += chunkSize) R.push(arr.slice(i, i + chunkSize));
      return R;
    };

    const flattenArray = obj => {
      const json = [];
      for (key of obj) {
        for (ob of key) json.push(ob);
      }
      return json;
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
        json.push(obj);
      });

      // Handling duplicated emails ============================================================
      for (i = 0; i < json.length - 1; i++) {
        let index = [];
        for (j = i + 1; j < json.length; j++) {
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
      // =======================================================================================

      // let arrayReduced = reduceArray(json, 'CardMasterID');
      let arrayReduced = reduceArray(json, 'DDRefforBank'); // NOTE: USE THIS ONE ONLY FOR "transaction dd". Check issue #71.
      const group = [];
      for (key in arrayReduced) group.push(arrayReduced[key]);
      arrayReduced = [];

      const chunkSize = 30;

      let countInbox = 0;
      const postToInbox = async data => {
        countInbox++;
        console.log(`Sending request ${countInbox} to inbox`);

        await new Promise(resolve => setTimeout(resolve, 200));

        await http.post({
          url: configuration.openfnInboxUrl,
          data,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        })(state);
      };

      while (group.length > 0) {
        // console.log('group.length', group.length);
        await postToInbox({
          fileName: data.name,
          fileType: data.name.split('-')[0],
          json: flattenArray(group.splice(0, chunkSize)),
          uploadDate: new Date(data.modifyTime).toISOString(),
        });
      }
      return { configuration, references: [], data: {} };
    });
  })
);
