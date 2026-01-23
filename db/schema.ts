import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// =============================================================================
// COURSES - Top level entity
// =============================================================================

/**
 * COURSES TABLE
 * - Represents learning courses
 * - One course contains multiple units
 * - Linked to user_progress for tracking active course
 */

// Define a 'courses' table in PostgreSQL
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageSrc: text("image_src").notNull(),
});

/**
 * COURSES RELATIONS
 * - One course can have many user progress records (users taking this course)
 * - One course contains many units
 */

// Define relationships for courses table
export const coursesRelations = relations(courses, ({ many }) => ({
  // One course can have many user progress records
  userProgress: many(userProgress), // Many users can progress through this course
  units: many(units), // Course consists of multiple units
}));

// =============================================================================
// UNITS - Second level in hierarchy
// =============================================================================

/**
 * UNITS TABLE
 * - Represents units within a course
 * - Each unit belongs to one course (course_id foreign key)
 * - One unit contains multiple lessons
 */

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  courseId: integer("course_id")
    .references(() => courses.id, {
      onDelete: "cascade", // Delete units when course is deleted
    })
    .notNull(),
  order: integer("order").notNull(), // Display order within course
});

/**
 * UNITS RELATIONS
 * - Each unit belongs to one course
 * - One unit contains many lessons
 */

export const unitsRelations = relations(units, ({ many, one }) => ({
  course: one(courses, {
    // Parent course this unit belongs to
    fields: [units.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons), // Units contain multiple lessons
}));

// =============================================================================
// LESSONS - Third level in hierarchy
// =============================================================================

/**
 * LESSONS TABLE
 * - Represents lessons within a unit
 * - Each lesson belongs to one unit (unit_id foreign key)
 * - One lesson contains multiple challenges
 */

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  unitId: integer("unit_id")
    .references(() => units.id, { onDelete: "cascade" }) // Delete lessons when unit is deleted
    .notNull(),
  order: integer("order").notNull(), // Display order within unit
});

/**
 * LESSONS RELATIONS
 * - Each lesson belongs to one unit
 * - One lesson contains many challenges
 */

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  unit: one(units, {
    // Parent unit this lesson belongs to
    fields: [lessons.unitId],
    references: [units.id],
  }),
  challenges: many(challenges), // Lessons contain multiple challenges
}));

// =============================================================================
// CHALLENGES - Fourth level in hierarchy (learning activities)
// =============================================================================

/**
 * CHALLENGE TYPE ENUM
 * - SELECT: Multiple choice questions
 * - ASSIST: Assisted/guided questions
 */

export const challengesEnum = pgEnum("type", ["SELECT", "ASSIST"]);

/**
 * CHALLENGES TABLE
 * - Represents individual challenges/activities within a lesson
 * - Each challenge belongs to one lesson (lesson_id foreign key)
 * - Challenges can be SELECT or ASSIST type
 */

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id")
    .references(() => lessons.id, { onDelete: "cascade" }) // Delete challenges when lesson is deleted
    .notNull(),
  type: challengesEnum("type").notNull(), // SELECT or ASSIST
  question: text("question").notNull(),
  order: integer("order").notNull(), // Display order within lesson
});

/**
 * CHALLENGES RELATIONS
 * - Each challenge belongs to one lesson
 * - One challenge can have many challenge options (possible answers)
 * - One challenge can have many progress records (user attempts)
 */

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  lessons: one(lessons, {
    // Parent lesson this challenge belongs to
    fields: [challenges.lessonId],
    references: [lessons.id],
  }),
  challengeOptions: many(challengeOptions), // Possible answers for this challenge
  challengeProgress: many(challengeProgress), // User progress records for this challenge
}));

// =============================================================================
// CHALLENGE OPTIONS - Possible answers for challenges
// =============================================================================

/**
 * CHALLENGE OPTIONS TABLE
 * - Represents possible answers/options for challenges
 * - Each option belongs to one challenge (challenge_id foreign key)
 * - Only one option should be marked as correct per challenge
 */

export const challengeOptions = pgTable("challenge_options", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, {
      onDelete: "cascade", // Delete options when challenge is deleted
    })
    .notNull(),
  text: text("text").notNull(), // Option text
  correct: boolean("correct").notNull(), // Whether this option is correct
  imageSrc: text("image_src"), // Optional image for the option
  audioSrc: text("audio_src"), // Optional audio for the option
});

/**
 * CHALLENGE OPTIONS RELATIONS
 * - Each option belongs to one challenge
 */

export const challengeOptionsRelations = relations(
  challengeOptions,
  ({ one }) => ({
    challenge: one(challenges, {
      // Parent challenge this option belongs to
      fields: [challengeOptions.challengeId],
      references: [challenges.id],
    }),
  })
);

// =============================================================================
// CHALLENGE PROGRESS - Tracks user completion of challenges
// =============================================================================

/**
 * CHALLENGE PROGRESS TABLE
 * - Tracks individual user progress on challenges
 * - Each record represents one user's attempt/completion of one challenge
 * - Uses Clerk user_id for user identification
 */

export const challengeProgress = pgTable("challenge_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Clerk user ID
  challengeId: integer("challenge_id")
    .references(() => challenges.id, {
      onDelete: "cascade", // Delete progress when challenge is deleted
    })
    .notNull(),
  completed: boolean("completed").notNull().default(false), // Whether user completed this challenge
});

/**
 * CHALLENGE PROGRESS RELATIONS
 * - Each progress record belongs to one challenge
 */

export const challengeProgressRelations = relations(
  challengeProgress,
  ({ one }) => ({
    challenge: one(challenges, {
      // The challenge this progress record is for
      fields: [challengeProgress.challengeId],
      references: [challenges.id],
    }),
  })
);

/**
 * USER PROGRESS TABLE
 * - Tracks overall learning progress for each user
 * - One record per user (using Clerk user_id as primary key)
 * - Tracks active course, hearts (lives), and points
 */

// User progress table - tracks each user's learning progress
export const userProgress = pgTable("user_progress", {
  userId: text("user_id").primaryKey(), // Clerk user ID as primary key
  userName: text("user_name").notNull().default("User"),
  userImageSrc: text("user_image_src").notNull().default("/mascot.svg"),
  // Foreign key reference to courses table
  activeCourseId: integer("active_course_id").references(() => courses.id, {
    onDelete: "cascade", // Handle course deletion
  }),
  hearts: integer("hearts").notNull().default(5), // User's lives/hearts
  points: integer("points").notNull().default(0), // User's points/score
});

/**
 * USER PROGRESS RELATIONS
 * - Each user progress record has one active course
 */

// Define relationships for user progress table
export const userProgressRelations = relations(userProgress, ({ one }) => ({
  // Each user progress record has one active course
  activeCourse: one(courses, {
    // The course the user is currently taking
    fields: [userProgress.activeCourseId], // Foreign key field
    references: [courses.id], // Referenced primary key
  }),
}));

export const userSubscription = pgTable("user_subscription", {
  // Primary key for the subscription record
  id: serial("id").primaryKey(),
  // The user ID from the authentication system (Clerk in this case)
  userId: text("user_id").notNull().unique(),
  // Stripe's customer ID - unique identifier in Stripe's system
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  // Stripe's subscription ID - tracks the specific subscription
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  // The price/plan ID the user is subscribed to
  stripePriceId: text("stripe_price_id").notNull(),
  // When the current billing period ends (used to check if subscription is active)
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end").notNull(),
});

// =============================================================================
// KEY RELATIONSHIPS SUMMARY:
// =============================================================================

/*
1. COURSE HIERARCHY:
   courses 1 → N units 1 → N lessons 1 → N challenges

2. CHALLENGE STRUCTURE:
   challenges 1 → N challenge_options (possible answers)
   challenges 1 → N challenge_progress (user attempts)

3. USER TRACKING:
   user_progress → courses (tracks active course)
   challenge_progress → challenges (tracks individual challenge completion)

4. CASCADE DELETES:
   - Deleting a course deletes all its units
   - Deleting a unit deletes all its lessons  
   - Deleting a lesson deletes all its challenges
   - Deleting a challenge deletes all its options and progress records
*/
