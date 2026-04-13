const https = require('https');
https.get('https://servicodados.ibge.gov.br/api/v3/malhas/estados/RS?formato=application/vnd.geo+json&intrarregiao=municipio', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log("Features count:", json.features ? json.features.length : 0);
      if(json.features && json.features.length > 0) {
        console.log("First feature properties:", json.features[0].properties);
      }
    } catch(e) {
      console.log("Error parsing JSON:", e.message, data.slice(0, 100));
    }
  });
});
