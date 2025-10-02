import { pgTable, serial, text } from "drizzle-orm/pg-core";

// Define a 'courses' table in PostgreSQL
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageSrc: text("image_src").notNull(),
});
