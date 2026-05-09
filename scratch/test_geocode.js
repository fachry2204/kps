const https = require('https');

const query = 'Jakarta'; // Simple query
const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

const options = {
  headers: {
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'User-Agent': 'PuskodalKopasus/1.0 (contact: admin@puskodal.id)'
  }
};

console.log('Fetching:', url);

https.get(url, options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Body:', data);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
