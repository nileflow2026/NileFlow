/**
 * Social Commerce Collection Setup Script
 * Run once to create all social commerce collections in Appwrite
 *
 * Usage: node backend/setup-social-collections.js
 */

const { db, ID } = require("./src/appwrite");
const { env } = require("./src/env");
const { SOCIAL_COLLECTIONS } = require("./schemas/socialCommerceSchemas");

const DATABASE_ID = env.APPWRITE_DATABASE_ID;

async function createCollection(collectionKey, schema) {
  const collectionId = ID.unique();
  console.log(`\n📦 Creating collection: ${schema.name} (${collectionId})...`);

  try {
    await db.createCollection(DATABASE_ID, collectionId, schema.name, [
      // Default permissions: authenticated users can read, owner can write
      // Adjust per-document in the controller
    ]);
    console.log(`✅ Collection created: ${schema.name}`);

    // Create attributes sequentially (Appwrite requires this)
    for (const attr of schema.attributes) {
      try {
        switch (attr.type) {
          case "string":
            await db.createStringAttribute(
              DATABASE_ID,
              collectionId,
              attr.key,
              attr.size || 255,
              attr.required || false,
              attr.default || null,
            );
            break;

          case "integer":
            await db.createIntegerAttribute(
              DATABASE_ID,
              collectionId,
              attr.key,
              attr.required || false,
              attr.min || 0,
              attr.max || 2147483647,
              attr.default ?? null,
            );
            break;

          case "float":
            await db.createFloatAttribute(
              DATABASE_ID,
              collectionId,
              attr.key,
              attr.required || false,
              attr.min || 0,
              attr.max || 999999999,
              attr.default ?? null,
            );
            break;

          case "boolean":
            await db.createBooleanAttribute(
              DATABASE_ID,
              collectionId,
              attr.key,
              attr.required || false,
              attr.default ?? null,
            );
            break;
        }
        console.log(`  ✅ Attribute: ${attr.key} (${attr.type})`);
      } catch (attrError) {
        console.error(`  ❌ Attribute ${attr.key} failed:`, attrError.message);
      }

      // Wait for attribute to be ready
      await new Promise((r) => setTimeout(r, 1500));
    }

    // Create indexes after all attributes are ready
    console.log(`  📇 Creating indexes for ${schema.name}...`);
    await new Promise((r) => setTimeout(r, 3000));

    for (const index of schema.indexes || []) {
      try {
        await db.createIndex(
          DATABASE_ID,
          collectionId,
          index.key,
          index.type,
          index.attributes,
          index.orders || [],
        );
        console.log(`  ✅ Index: ${index.key}`);
      } catch (indexError) {
        console.error(`  ❌ Index ${index.key} failed:`, indexError.message);
      }
      await new Promise((r) => setTimeout(r, 1500));
    }

    return collectionId;
  } catch (error) {
    console.error(`❌ Failed to create ${schema.name}:`, error.message);
    return null;
  }
}

async function main() {
  console.log("🚀 Social Commerce Collection Setup");
  console.log("====================================");
  console.log(`Database: ${DATABASE_ID}`);

  const collectionIds = {};

  for (const [key, schema] of Object.entries(SOCIAL_COLLECTIONS)) {
    const id = await createCollection(key, schema);
    if (id) {
      collectionIds[key] = id;
    }
  }

  console.log("\n====================================");
  console.log("📋 Collection IDs (add to .env):");
  console.log("====================================");
  for (const [key, id] of Object.entries(collectionIds)) {
    const envKey = `SOCIAL_${key}_COLLECTION_ID`;
    console.log(`${envKey}=${id}`);
  }
  console.log("====================================");
  console.log("✅ Setup complete!");
}

main().catch(console.error);
