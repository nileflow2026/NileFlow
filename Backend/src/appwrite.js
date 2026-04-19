const {
  Client,
  Account,
  Databases,
  Users,
  Functions,
  Storage,
  ID,
} = require("node-appwrite");
const { env } = require("./env");
const { Avatars } = require("node-appwrite");

if (!env.APPWRITE_API_KEY) {
  throw new Error("CRITICAL: APPWRITE_API_KEY is not set");
}

const client = new Client()
  .setEndpoint(env.APPWRITE_ENDPOINT)
  .setProject(env.APPWRITE_PROJECT_ID)
  .setKey(env.APPWRITE_API_KEY);

module.exports.account = new Account(client);
module.exports.db = new Databases(client);
module.exports.users = new Users(client);
module.exports.avatars = new Avatars(client);
module.exports.functions = new Functions(client);
module.exports.storage = new Storage(client);
module.exports.ID = ID;
