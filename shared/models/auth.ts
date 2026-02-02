import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, boolean, serial, text, integer } from "drizzle-orm/pg-core";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  passwordHash: text("password_hash"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  downloadUrl: text("download_url").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // 'Android', 'PC', 'Programs'
  developer: text("developer"), // e.g., "From: FitGirl"
  description: text("description"),
  youtubeUrl: text("youtube_url"),
  order: integer("order").default(0),
});

export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  passwordHash: varchar("password_hash").notNull(),
  isSuperAdmin: boolean("is_super_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Admin = typeof admins.$inferSelect;
export type Game = typeof games.$inferSelect;
