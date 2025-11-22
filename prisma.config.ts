import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// ✅ Explicitly load your .env before using env vars
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // ✅ Access the environment variable directly
    url: process.env.DATABASE_URL!,
  },
});
