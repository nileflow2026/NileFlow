/**
 * setup-deletion-collection.js
 * Run this once to create the deletion_requests collection in Appwrite.
 * Usage: node services/setup-deletion-collection.js
 */

const { Client, Databases, ID } = require("node-appwrite");
require("dotenv").config();

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;

async function setup() {
  console.log("🔧 Setting up deletion_requests collection...");

  const COLLECTION_ID =
    process.env.APPWRITE_DELETION_REQUESTS_COLLECTION_ID || ID.unique();
  console.log(`📋 Collection ID to use: ${COLLECTION_ID}`);
  console.log(
    "   (Add this to your .env as APPWRITE_DELETION_REQUESTS_COLLECTION_ID)\n",
  );

  try {
    // Create collection (skip if already exists)
    let collection;
    try {
      collection = await db.createCollection(
        DATABASE_ID,
        COLLECTION_ID,
        "deletion_requests",
        [], // permissions: server-side only (no client SDK access)
      );
      console.log("✅ Collection created:", collection.$id);
    } catch (createErr) {
      if (createErr.message && createErr.message.includes("already exists")) {
        console.log(
          `ℹ️  Collection ${COLLECTION_ID} already exists — skipping creation, verifying attributes...\n`,
        );
      } else {
        throw createErr;
      }
    }

    const attrs = [
      {
        type: "string",
        key: "userId",
        size: 36,
        required: true,
        array: false,
      },
      {
        type: "string",
        key: "email",
        size: 254,
        required: true,
        array: false,
      },
      {
        type: "string",
        key: "status",
        size: 20,
        required: false,
        default: "pending",
        array: false,
      },
      {
        type: "string",
        key: "requestedAt",
        size: 30,
        required: true,
        array: false,
      },
      {
        type: "string",
        key: "scheduledDeletionDate",
        size: 30,
        required: true,
        array: false,
      },
      {
        type: "string",
        key: "completedAt",
        size: 30,
        required: false,
        default: null,
        array: false,
      },
      {
        type: "string",
        key: "cancelledAt",
        size: 30,
        required: false,
        default: null,
        array: false,
      },
      {
        type: "string",
        key: "otpHash",
        size: 80,
        required: false,
        default: null,
        array: false,
      },
      {
        type: "string",
        key: "otpExpiry",
        size: 30,
        required: false,
        default: null,
        array: false,
      },
      {
        type: "integer",
        key: "otpAttempts",
        required: false,
        default: 0,
        min: 0,
        max: 10,
        array: false,
      },
      {
        type: "integer",
        key: "otpSendCount",
        required: false,
        default: 0,
        min: 0,
        max: 20,
        array: false,
      },
      {
        type: "string",
        key: "otpWindowStart",
        size: 30,
        required: false,
        default: null,
        array: false,
      },
      {
        type: "boolean",
        key: "activeOrdersBlocked",
        required: false,
        default: false,
        array: false,
      },
      {
        type: "boolean",
        key: "isVendor",
        required: false,
        default: false,
        array: false,
      },
      {
        type: "boolean",
        key: "hasPaymentRecords",
        required: false,
        default: false,
        array: false,
      },
      {
        type: "string",
        key: "retentionNote",
        size: 500,
        required: false,
        default: null,
        array: false,
      },
      {
        type: "string",
        key: "auditLog",
        size: 5000,
        required: false,
        default: "[]",
        array: false,
      },
      {
        type: "string",
        key: "cancelReason",
        size: 300,
        required: false,
        default: null,
        array: false,
      },
    ];

    for (const attr of attrs) {
      try {
        if (attr.type === "string") {
          await db.createStringAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.size,
            attr.required,
            attr.default,
            attr.array,
          );
        } else if (attr.type === "boolean") {
          await db.createBooleanAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.required,
            attr.default,
            attr.array,
          );
        } else if (attr.type === "integer") {
          await db.createIntegerAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.required,
            attr.min,
            attr.max,
            attr.default,
            attr.array,
          );
        }
        console.log(`  ✅ Attribute created: ${attr.key}`);
        // Appwrite requires a small delay between attribute creation
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        console.warn(`  ⚠️  Attribute ${attr.key}: ${err.message}`);
      }
    }

    // Create index on userId for fast lookup
    await new Promise((r) => setTimeout(r, 2000));
    try {
      await db.createIndex(
        DATABASE_ID,
        COLLECTION_ID,
        "idx_userId",
        "key",
        ["userId"],
        ["ASC"],
      );
      console.log("  ✅ Index on userId created");
    } catch (err) {
      console.warn(`  ⚠️  Index on userId: ${err.message}`);
    }

    try {
      await db.createIndex(
        DATABASE_ID,
        COLLECTION_ID,
        "idx_status",
        "key",
        ["status"],
        ["ASC"],
      );
      console.log("  ✅ Index on status created");
    } catch (err) {
      console.warn(`  ⚠️  Index on status: ${err.message}`);
    }

    console.log(`
✅ Setup complete!
Add this to your .env file:
APPWRITE_DELETION_REQUESTS_COLLECTION_ID=${COLLECTION_ID}
DELETION_GRACE_PERIOD_DAYS=7
`);
  } catch (err) {
    console.error("❌ Setup failed:", err.message);
    process.exit(1);
  }
}

setup();
