import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const currentDir = typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

async function main() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not set");
    }

    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });

    const db = drizzle(pool);

    console.log("Running migrations...");

    await migrate(db, {
        migrationsFolder: path.join(currentDir, "../migrations"),
    });

    console.log("Migrations completed!");

    await pool.end();
}

main().catch((err) => {
    console.error("Migration failed!");
    console.error(err);
    process.exit(1);
});
