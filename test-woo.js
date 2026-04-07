require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch'); // or global fetch
const token = Buffer.from(process.env.WOOCOMMERCE_KEY + ':' + process.env.WOOCOMMERCE_SECRET).toString('base64');
fetch(process.env.WOOCOMMERCE_URL + '/wp-json/wc/v3/products?per_page=5', { headers: { Authorization: 'Basic ' + token } })
  .then(r => r.json())
  .then(data => {
     let out = [];
     for(let d of data) {
         out.push({
             name: d.name,
             attributes: d.attributes,
             meta_data: d.meta_data.filter(m => !m.key.startsWith('_')).map(m => ({key: m.key, value: m.value}))
         });
     }
     console.log(JSON.stringify(out, null, 2));
  });
