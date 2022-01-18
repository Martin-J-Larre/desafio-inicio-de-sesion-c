import { MongoClient } from "mongodb";
import 'dotenv/config'

console.log(process.env.MONGO_URI);
const client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

await client.connect();

const messagesCollection = client.db("challenge-auth").collection("messages");

export { messagesCollection };