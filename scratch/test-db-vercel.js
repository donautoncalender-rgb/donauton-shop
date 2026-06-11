const { Client } = require('pg');
const client = new Client({ connectionString: "postgresql://postgres.ntpjcjuaxixeoceukxfc:fmJq%23AViRp7yWJarrd9@aws-1-eu-central-1.pooler.supabase.com:5432/postgres" });
client.connect().then(() => { console.log("Production database connection worked!"); client.end(); }).catch(console.error);
