// Appwrite.js
import {
  Account,
  Avatars,
  Client,
  Databases,
  Functions,
  ID,
  Query,
  Storage,
} from "appwrite";

import axiosClient from "./api"; // Keep this import for API calls

export const Config = {
  endpoint: "https://fra.cloud.appwrite.io/v1",
  projectId: "6926c7df002fa7831d94",
  platform: "nileflowafrica.com",
  databaseId: "6926c9bb00320db14571",
  userCollectionId: "6926d95b000583b78df2",
  reviewsCollectionId: "692745c20025084746dc",
  StorageId: "692a3b700039c02fb4bc",
  productCollectionId: "692745740005ffe9fa00",
  cartCollectionId: "692744310003a9f2c3eb",
  orderCollection: "69274563002eee2bea49",
  currenciesCollection: "692744d4003a2b4b97b8",
  addressCollection: "692743ec001f0b2e851e",
  functionId: "67d25e700014c71138d1",
  transactionsId: "67f745eb00152657d543",
  orderCollectionId: "69274563002eee2bea49",
  updateOrderStatusFunctionId: "692d903e000d2d217887",
  reportsCollectionId: "67fa8d870033344cee3c",
  searchcollections: "692745d90015fbc37a87",
  NOTIFICATIONS_COLLECTION_ID: "69274552002816052be0",
};

const client = new Client();
client.setEndpoint(Config.endpoint).setProject(Config.projectId);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const functions = new Functions(client);

// IMPORTANT: Do not import from GlobalProvider here.
// Instead, move functions that depend on the GlobalProvider state (like `signUp` and `signIn`)
// to a new file or the GlobalProvider itself.

// Export the Appwrite services for use in other files.
export {
  account,
  avatars,
  axiosClient,
  client,
  databases,
  functions,
  ID,
  Query,
  storage,
};

// ... keep other helper functions that do not depend on GlobalProvider state
// e.g. uploadFile, getImageViewURL, getlatestProducts, fetchProducts, etc.
