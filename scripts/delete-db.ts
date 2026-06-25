// scripts/delete-db.ts
import { config } from 'dotenv';
config({ path: '.env' });

import { MongoClient } from 'mongodb';

async function deleteAllTickets() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'tickets';

  if (!uri) {
    console.error('❌ MONGODB_URI not set in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db(dbName);
  const collection = db.collection('tickets');

  const result = await collection.deleteMany({});
  console.log(`✅ Deleted ${result.deletedCount} tickets.`);

  await client.close();
  process.exit(0);
}

deleteAllTickets().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
