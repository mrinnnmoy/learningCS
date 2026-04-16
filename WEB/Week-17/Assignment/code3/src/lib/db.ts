import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const schema = require("../../drizzle/schema.js");

const connection = postgres(process.env.DATABASE_URL!);
export const db = drizzle(connection, { schema });
