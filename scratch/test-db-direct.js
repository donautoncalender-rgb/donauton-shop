const { Client } = require('pg');
const client = new Client({ connectionString: "postgresql://postgres.iugkanczmpqilpfnojxl:fmJq%23AViRp7yWJarrd9@aws-0-eu-central-1.pooler.supabase.com:5432/postgres" });
client.connect().then(() => { console.log("Direct connection worked!"); client.end(); }).catch(console.error);
