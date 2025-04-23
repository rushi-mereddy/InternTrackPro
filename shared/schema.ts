import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  profilePicture: text("profile_picture"),
  contactNumber: text("contact_number"),
  currentCity: text("current_city"),
  gender: text("gender"),
  languages: jsonb("languages").$type<string[]>(),
  userType: text("user_type").notNull(), // student, employer, admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true });

// Student Profiles
export const studentProfiles = pgTable("student_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  educationLevel: text("education_level"),
  institution: text("institution"),
  graduationYear: integer("graduation_year"),
  studentType: text("student_type"), // college student, fresher, working professional, etc.
  careerObjective: text("career_objective"),
  resumeUrl: text("resume_url"),
  interests: jsonb("interests").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStudentProfileSchema = createInsertSchema(studentProfiles)
  .omit({ id: true, createdAt: true });

// Employer Profiles
export const employerProfiles = pgTable("employer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  companyName: text("company_name").notNull(),
  companyLogo: text("company_logo"),
  companyWebsite: text("company_website"),
  industry: text("industry"),
  companySize: text("company_size"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmployerProfileSchema = createInsertSchema(employerProfiles)
  .omit({ id: true, createdAt: true });

// Student Skills
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentProfiles.id),
  skillName: text("skill_name").notNull(),
  proficiency: text("proficiency"), // beginner, intermediate, expert
});

export const insertSkillSchema = createInsertSchema(skills)
  .omit({ id: true });

// Student Experience
export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentProfiles.id),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  isCurrent: boolean("is_current"),
  description: text("description"),
  type: text("type"), // job, internship, project
});

export const insertExperienceSchema = createInsertSchema(experiences)
  .omit({ id: true });

// Student Education
export const educations = pgTable("educations", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentProfiles.id),
  degree: text("degree").notNull(),
  institution: text("institution").notNull(),
  startYear: integer("start_year"),
  endYear: integer("end_year"),
  grade: text("grade"),
  description: text("description"),
});

export const insertEducationSchema = createInsertSchema(educations)
  .omit({ id: true });

// Internships
export const internships = pgTable("internships", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").notNull().references(() => employerProfiles.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location"),
  isRemote: boolean("is_remote").default(false),
  isPartTime: boolean("is_part_time").default(false),
  stipendAmount: integer("stipend_amount"),
  stipendCurrency: text("stipend_currency").default("INR"),
  durationMonths: integer("duration_months").notNull(),
  startDate: date("start_date"),
  applicationDeadline: date("application_deadline"),
  skillsRequired: jsonb("skills_required").$type<string[]>(),
  responsibilities: jsonb("responsibilities").$type<string[]>(),
  perks: jsonb("perks").$type<string[]>(),
  jobOfferPossibility: boolean("job_offer_possibility").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInternshipSchema = createInsertSchema(internships)
  .omit({ id: true, createdAt: true });

// Jobs
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").notNull().references(() => employerProfiles.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location"),
  isRemote: boolean("is_remote").default(false),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  salaryCurrency: text("salary_currency").default("INR"),
  experienceRequiredYears: integer("experience_required_years"),
  isFresherJob: boolean("is_fresher_job").default(false),
  skillsRequired: jsonb("skills_required").$type<string[]>(),
  responsibilities: jsonb("responsibilities").$type<string[]>(),
  applicationDeadline: date("application_deadline"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobs)
  .omit({ id: true, createdAt: true });

// Applications
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentProfiles.id),
  internshipId: integer("internship_id").references(() => internships.id),
  jobId: integer("job_id").references(() => jobs.id),
  coverLetter: text("cover_letter"),
  status: text("status").default("applied"), // applied, shortlisted, rejected, hired
  applicationDate: timestamp("application_date").defaultNow(),
});

export const insertApplicationSchema = createInsertSchema(applications)
  .omit({ id: true, applicationDate: true });

// Courses
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  courseType: text("course_type").notNull(), // certification, placement_guarantee
  durationWeeks: integer("duration_weeks").notNull(),
  price: integer("price").notNull(),
  discountPercentage: integer("discount_percentage").default(0),
  rating: integer("rating"), // 1-5 scale
  learnerCount: integer("learner_count").default(0),
  placementGuarantee: boolean("placement_guarantee").default(false),
  placementSalaryMin: integer("placement_salary_min"),
  placementSalaryMax: integer("placement_salary_max"),
  placementType: text("placement_type"), // job, internship
  placementStipend: integer("placement_stipend"),
  category: text("category").notNull(),
  thumbnail: text("thumbnail"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCourseSchema = createInsertSchema(courses)
  .omit({ id: true, createdAt: true });

// Enrollments
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentProfiles.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  paymentId: text("payment_id"),
  paymentStatus: text("payment_status").default("pending"),
  enrollmentDate: timestamp("enrollment_date").defaultNow(),
  completionDate: timestamp("completion_date"),
  certificateUrl: text("certificate_url"),
  progressPercentage: integer("progress_percentage").default(0),
});

export const insertEnrollmentSchema = createInsertSchema(enrollments)
  .omit({ id: true, enrollmentDate: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;

export type EmployerProfile = typeof employerProfiles.$inferSelect;
export type InsertEmployerProfile = z.infer<typeof insertEmployerProfileSchema>;

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export type Experience = typeof experiences.$inferSelect;
export type InsertExperience = z.infer<typeof insertExperienceSchema>;

export type Education = typeof educations.$inferSelect;
export type InsertEducation = z.infer<typeof insertEducationSchema>;

export type Internship = typeof internships.$inferSelect;
export type InsertInternship = z.infer<typeof insertInternshipSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
