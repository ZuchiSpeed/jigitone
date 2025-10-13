import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

// Define a 'courses' table in PostgreSQL
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageSrc: text("image_src").notNull(),
});

// Define relationships for courses table
export const coursesRelations = relations(courses, ({ many }) => ({
  // One course can have many user progress records
  userProgress: many(userProgress),
}));

// User progress table - tracks each user's learning progress
export const userProgress = pgTable("user_progress", {
  userId: text("user_id").primaryKey(), // Clerk user ID as primary key
  userName: text("user_name").notNull().default("User"),
  userImageSrc: text("user_image_src").notNull().default("/mascot.svg"),
  // Foreign key reference to courses table
  activeCourseId: integer("active_course_id").references(() => courses.id, {
    onDelete: "cascade",
  }),
  hearts: integer("hearts").notNull().default(5),
  points: integer("points").notNull().default(0),
});

// Define relationships for user progress table
export const userProgressRelations = relations(userProgress, ({ one }) => ({
  // Each user progress record has one active course
  activeCourse: one(courses, {
    fields: [userProgress.activeCourseId], // Foreign key field
    references: [courses.id], // Referenced primary key
  }),
}));
