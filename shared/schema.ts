import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// File conversion jobs table for tracking async operations
export const fileJobs = pgTable("file_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  fileType: text("file_type").notNull(), // pdf, docx, etc.
  conversionType: text("conversion_type").notNull(), // to_text, to_images, etc.
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  originalSize: integer("original_size").default(0),
  resultData: json("result_data"), // Store conversion results
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertFileJobSchema = createInsertSchema(fileJobs).pick({
  filename: true,
  fileType: true,
  conversionType: true,
  originalSize: true,
});

export type InsertFileJob = z.infer<typeof insertFileJobSchema>;
export type FileJob = typeof fileJobs.$inferSelect;

// Crypto conversion rates cache
export const cryptoRates = pgTable("crypto_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromCurrency: text("from_currency").notNull(),
  toCurrency: text("to_currency").notNull(),
  rate: text("rate").notNull(), // Store as string for precision
  marketData: json("market_data").default({}), // Additional market info
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertCryptoRateSchema = createInsertSchema(cryptoRates).pick({
  fromCurrency: true,
  toCurrency: true,
  rate: true,
  marketData: true,
});

export type InsertCryptoRate = z.infer<typeof insertCryptoRateSchema>;
export type CryptoRate = typeof cryptoRates.$inferSelect;

// Comments table for user feedback
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email"),
  content: text("content").notNull(),
  toolId: text("tool_id"), // Which tool the comment is about
  rating: integer("rating").default(5), // 1-5 star rating
  isPublished: text("is_published").notNull().default("true"), // Published status
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  authorName: true,
  authorEmail: true,
  content: true,
  toolId: true,
  rating: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
