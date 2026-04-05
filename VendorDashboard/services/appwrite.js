import { Storage, ID, Query, Client } from "appwrite";

const client = new Client();
client
  .setEndpoint("https://fra.cloud.appwrite.io/v1") // Replace with your Appwrite endpoint
  .setProject("6926c7df002fa7831d94"); // Replace with your Appwrite project ID

const storage = new Storage(client);

export const Config = {
  endpoint: "https://fra.cloud.appwrite.io/v1",
  projectId: "6926c7df002fa7831d94",
  bucketId: "692a3b700039c02fb4bc",
};

export { ID, client, Query, storage };
