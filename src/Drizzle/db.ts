import "dotenv/config";

//import { drizzle } from "drizzle-orm/node-postgres"
import { drizzle } from "drizzle-orm/neon-http";
//import { Client } from "pg"
import * as schema from "./schema";
import { neon } from "@neondatabase/serverless";

// export const client = new Client({
//     connectionString: process.env.DATABASE_URL as string
// })

export const client = neon(process.env.DATABASE_URL!);

// const main = async () => {
//     await client.connect()
// }
// main().then(() => {
//     console.log("Connected to the database")
// }).catch((error) => {
//     console.error("Error connecting to the database:", error)
// })

const db = drizzle(client, { schema, logger: true });

export default db;
