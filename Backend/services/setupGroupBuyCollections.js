/**
 * setupGroupBuyCollections.js
 *
 * One-time Appwrite collection setup script for the Group Buying System.
 *
 * Run with:
 *   node Backend/services/setupGroupBuyCollections.js
 *
 * Creates three collections:
 *   1. group_orders        — core group buy documents
 *   2. group_buy_settings  — per-product group buy configuration (admin-driven)
 *   3. pricing_tiers       — reusable tier definitions per product
 *
 * After running, add the printed collection IDs to your .env file.
 */

const {
  Client,
  Databases,
  ID,
  Permission,
  Role,
  IndexType,
} = require("node-appwrite");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;

async function createCollectionSafe(name, collectionId) {
  try {
    const col = await db.createCollection(
      DATABASE_ID,
      collectionId || ID.unique(),
      name,
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
    );
    console.log(`✅ Created collection "${name}" → ID: ${col.$id}`);
    return col.$id;
  } catch (err) {
    if (err.code === 409) {
      console.log(`⚠️  Collection "${name}" already exists — skipping`);
      return collectionId;
    }
    throw err;
  }
}

async function createAttrSafe(dbId, colId, fn) {
  try {
    await fn();
  } catch (err) {
    if (err.code === 409) return; // already exists
    throw err;
  }
}

async function createIndex(dbId, colId, key, type, attrs, orders) {
  try {
    await db.createIndex(dbId, colId, key, type, attrs, orders);
    console.log(`  🔍 Index "${key}" created`);
  } catch (err) {
    if (err.code === 409) return;
    throw err;
  }
}

// --------------------------------------------------------------------------
async function setupGroupOrders(colId) {
  const A = (fn) => createAttrSafe(DATABASE_ID, colId, fn);
  const c = db.createStringAttribute.bind(db);
  const ci = db.createIntegerAttribute.bind(db);
  const cf = db.createFloatAttribute.bind(db);
  const cb = db.createBooleanAttribute.bind(db);
  const ca = db.createStringAttribute.bind(db);

  await A(() => c(DATABASE_ID, colId, "productId", 255, true));
  await A(() => c(DATABASE_ID, colId, "creatorId", 255, true));
  // participants stored as JSON string array (Appwrite array workaround)
  await A(() =>
    db.createStringAttribute(
      DATABASE_ID,
      colId,
      "participants",
      65535,
      false,
      "[]",
    ),
  );
  await A(() => ci(DATABASE_ID, colId, "maxParticipants", true, 2, 500));
  await A(() => cf(DATABASE_ID, colId, "basePrice", true, null, 0));
  await A(() => cf(DATABASE_ID, colId, "currentPrice", true, null, 0));
  await A(() => c(DATABASE_ID, colId, "priceStrategy", 32, false, "tiered"));
  // tiers stored as JSON string
  await A(() => c(DATABASE_ID, colId, "tiers", 65535, false, "[]"));
  await A(() => c(DATABASE_ID, colId, "status", 32, false, "pending"));
  await A(() => c(DATABASE_ID, colId, "expiresAt", 64, false));
  await A(() => c(DATABASE_ID, colId, "productName", 512, false));
  await A(() => c(DATABASE_ID, colId, "productImage", 512, false));
  await A(() => c(DATABASE_ID, colId, "currency", 16, false, "USD"));

  // Indexes for fast lookups
  await createIndex(
    DATABASE_ID,
    colId,
    "idx_product_status",
    IndexType.Key,
    ["productId", "status"],
    ["ASC", "ASC"],
  );
  await createIndex(
    DATABASE_ID,
    colId,
    "idx_status_expires",
    IndexType.Key,
    ["status", "expiresAt"],
    ["ASC", "ASC"],
  );
  await createIndex(
    DATABASE_ID,
    colId,
    "idx_creator",
    IndexType.Key,
    ["creatorId"],
    ["ASC"],
  );

  console.log("  ✅ group_orders attributes + indexes set up");
}

// --------------------------------------------------------------------------
async function setupGroupBuySettings(colId) {
  const A = (fn) => createAttrSafe(DATABASE_ID, colId, fn);

  await A(() =>
    db.createStringAttribute(DATABASE_ID, colId, "productId", 255, true),
  );
  await A(() =>
    db.createBooleanAttribute(DATABASE_ID, colId, "enabled", false, false),
  );
  await A(() =>
    db.createIntegerAttribute(
      DATABASE_ID,
      colId,
      "minGroupSize",
      false,
      null,
      null,
      2,
    ),
  );
  await A(() =>
    db.createIntegerAttribute(
      DATABASE_ID,
      colId,
      "maxGroupSize",
      false,
      null,
      null,
      10,
    ),
  );
  await A(() =>
    db.createIntegerAttribute(
      DATABASE_ID,
      colId,
      "ttlHours",
      false,
      null,
      null,
      24,
    ),
  );
  await A(() =>
    db.createStringAttribute(
      DATABASE_ID,
      colId,
      "priceStrategy",
      32,
      false,
      "tiered",
    ),
  );
  // Default tiers JSON string for this product
  await A(() =>
    db.createStringAttribute(
      DATABASE_ID,
      colId,
      "defaultTiers",
      65535,
      false,
      "[]",
    ),
  );
  await A(() =>
    db.createStringAttribute(DATABASE_ID, colId, "updatedBy", 255, false),
  );

  await createIndex(
    DATABASE_ID,
    colId,
    "idx_product",
    IndexType.Key,
    ["productId"],
    ["ASC"],
  );

  console.log("  ✅ group_buy_settings attributes + indexes set up");
}

// --------------------------------------------------------------------------
async function setupPricingTiers(colId) {
  const A = (fn) => createAttrSafe(DATABASE_ID, colId, fn);

  await A(() =>
    db.createStringAttribute(DATABASE_ID, colId, "productId", 255, true),
  );
  await A(() =>
    db.createStringAttribute(DATABASE_ID, colId, "label", 128, false),
  );
  await A(() =>
    db.createIntegerAttribute(DATABASE_ID, colId, "minParticipants", true, 1),
  );
  await A(() =>
    db.createFloatAttribute(DATABASE_ID, colId, "price", true, null, 0),
  );
  await A(() =>
    db.createFloatAttribute(
      DATABASE_ID,
      colId,
      "discountFraction",
      false,
      null,
      0,
    ),
  );
  await A(() =>
    db.createBooleanAttribute(DATABASE_ID, colId, "isActive", false, true),
  );
  await A(() =>
    db.createIntegerAttribute(
      DATABASE_ID,
      colId,
      "sortOrder",
      false,
      null,
      null,
      0,
    ),
  );

  await createIndex(
    DATABASE_ID,
    colId,
    "idx_product_tier",
    IndexType.Key,
    ["productId", "minParticipants"],
    ["ASC", "ASC"],
  );

  console.log("  ✅ pricing_tiers attributes + indexes set up");
}

// --------------------------------------------------------------------------
async function main() {
  console.log("🚀 Setting up NileFlow Group Buy collections...\n");

  const groupOrdersId = await createCollectionSafe(
    "group_orders",
    process.env.APPWRITE_GROUP_ORDER_COLLECTION_ID,
  );
  const settingsId = await createCollectionSafe(
    "group_buy_settings",
    process.env.APPWRITE_GROUP_BUY_SETTINGS_COLLECTION_ID,
  );
  const pricingTiersId = await createCollectionSafe(
    "pricing_tiers",
    process.env.APPWRITE_PRICING_TIERS_COLLECTION_ID,
  );

  console.log("\n📌 Setting up attributes...\n");
  await setupGroupOrders(groupOrdersId);
  await setupGroupBuySettings(settingsId);
  await setupPricingTiers(pricingTiersId);

  console.log(`
✅ Done! Add these to your .env:

APPWRITE_GROUP_ORDER_COLLECTION_ID=${groupOrdersId}
APPWRITE_GROUP_BUY_SETTINGS_COLLECTION_ID=${settingsId}
APPWRITE_PRICING_TIERS_COLLECTION_ID=${pricingTiersId}
`);
}

main().catch((err) => {
  console.error("❌ Setup failed:", err);
  process.exit(1);
});
