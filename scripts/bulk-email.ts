// scripts/bulk-create-and-email.ts
import { config } from 'dotenv';
config({ path: '.env' });

import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { MongoClient } from 'mongodb';
import QRCode from 'qrcode';
import { sendTicketEmail } from '../lib/email';
import { randomUUID } from 'crypto';

async function generateQRDataUrl(text: string): Promise<string> {
  return await QRCode.toDataURL(text);
}

function buildTicket(email: string, name: string, serial: number, ticketNumber: string, qrDataUrl: string) {
  return {
    id: randomUUID(),
    serialNumber: serial,
    ticketNumber: ticketNumber,
    mail: email,
    name: name,
    issuedByName: 'Bulk Importer',
    issuedByEmail: 'admin@yourdomain.com',
    createdAt: new Date(),
    isValid: true,
    scannedAt: null,
    qrCodeDataUrl: qrDataUrl,
  };
}

async function main() {
  const filePath = path.resolve(
    process.cwd(),
    'PyTorch Meetup Nepal - Event Registration (Responses) - Form Responses 1.csv'
  );

  const rows: Array<{ email: string; name: string }> = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
      .on('data', (row: any) => {
        const email = row['Email Address']?.trim() || row['Email']?.trim();
        const name = row['Full Name']?.trim() || row['Name']?.trim();
        if (email && name) {
          rows.push({ email, name });
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`📋 Found ${rows.length} registrants in CSV.`);
  if (rows.length === 0) {
    console.error('❌ No valid rows. Check CSV columns.');
    process.exit(1);
  }

  // Connect to MongoDB
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

  // Find max serial number
  const lastTicket = await collection.findOne({}, { sort: { serialNumber: -1 } });
  let nextSerial = lastTicket ? lastTicket.serialNumber + 1 : 1;

  let success = 0,
    fail = 0;
  const failedEmails: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const { email, name } = rows[i];
    const serial = nextSerial++;
    const ticketNumber = `TICKET-${String(serial).padStart(4, '0')}`;

    try {
      const qrDataUrl = await generateQRDataUrl(ticketNumber);
      const ticket = buildTicket(email, name, serial, ticketNumber, qrDataUrl);

      await collection.insertOne(ticket);

      const emailResult = await sendTicketEmail(ticket);
      if (emailResult.success) {
        console.log(`✅ [${i + 1}/${rows.length}] Created & mailed: ${email}`);
        success++;
      } else {
        console.warn(`⚠️ [${i + 1}/${rows.length}] Ticket created but email NOT sent for ${email} (${emailResult.message || 'skipped'})`);
        fail++;
        failedEmails.push(email);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`❌ [${i + 1}/${rows.length}] Failed for ${email}: ${msg}`);
      fail++;
      failedEmails.push(email);
    }

    if (i < rows.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log('\n🎉 Done!');
  console.log(`✅ Success (created + mailed): ${success}`);
  console.log(`❌ Failed (ticket created but email not sent): ${fail}`);
  if (failedEmails.length) {
    console.log('Failed emails:', failedEmails.join(', '));
  }

  await client.close();
}

main().catch((err) => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
