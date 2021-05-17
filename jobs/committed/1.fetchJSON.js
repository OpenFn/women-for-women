alterState(state => {
  return list('/')(state).then(state => {
    console.log(state);
    const fileNames = [
      '20210323 wfwi donors',
      '20210323 wfwi live sponsorships',
      '20210323 wfwi transactions - cards',
      '20210323 wfwi transactions - dd',
      '20210323 wfwi custom cc fields',
      '20210323 wfwi custom dd fields',
    ];

    const trimDate = date => {
      const dateString = new Date(date).toISOString();
      const dateArray = dateString.split('T');
      return new Date(dateArray[0]);
    };

    const files = state.data.filter(file => fileNames.includes(file.name.split('.')[0].toLowerCase()));
    // const files = state.data.filter(file => file.size < 1000000);
    // const files = state.data;
    console.log('Files are:', files);

    return { ...state, files };
  });
});

//   each(
//     '$.files[*]',
//     alterState(state => {
//       const { configuration, data } = state;
//       return getJSON(`/UP/${data.name}`)(state).then(state => {
//         const splitName = data.name.split('.');
//         const type = data.name.includes('Extract')===true ? 'extract' :
//           data.name.includes('Component')===true ? 'component' : splitName[0];
//         const fileContent = {
//           fileName: data.name,
//           fileType: type,
//           json: JSON.parse(state.data),
//           uploadDate: new Date(data.modifyTime).toISOString(),
//           siteCode: splitName[0].substring(splitName[0].length - 4),
//         };
//         return http
//           .post({
//             url: configuration.openfnInboxUrl,
//             data: fileContent,
//             maxContentLength: Infinity,
//             maxBodyLength: Infinity,
//           })(state)
//           .then(() => {
//             console.log(`Posted ${data.name} to OpenFn Inbox.\n`);
//             return { configuration, references: [] };
//           });
//       });
//     })
//   );
