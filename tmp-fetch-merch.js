require('dotenv').config({ path: '.env.local' });
(async () => {
   const token = Buffer.from(process.env.WOOCOMMERCE_KEY + ':' + process.env.WOOCOMMERCE_SECRET).toString('base64');
   const r = await fetch(process.env.WOOCOMMERCE_URL + '/wp-json/wc/v3/products?category=99&per_page=3', { headers: { Authorization: 'Basic ' + token } });
   const data = await r.json();
   console.log(JSON.stringify(data.map(d => ({ 
       name: d.name, 
       attributes: d.attributes, 
       type: d.type, 
       variations: d.variations,
       meta_data_keys: d.meta_data.filter(m => m.key && !m.key.startsWith('_')).map(m => m.key)
   })), null, 2));
})();
