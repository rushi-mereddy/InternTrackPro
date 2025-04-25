import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertStudentProfileSchema,
  insertEmployerProfileSchema,
  insertSkillSchema,
  insertExperienceSchema,
  insertEducationSchema,
  insertInternshipSchema,
  insertJobSchema,
  insertApplicationSchema,
  insertCourseSchema,
  insertEnrollmentSchema
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";

// Using a smaller value to avoid TimeoutOverflowWarning
const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 7; // One week instead of 30 days

export async function registerRoutes(app: Express): Promise<Server> {
  console.log('Registering routes...');
  const httpServer = createServer(app);

  // Setup session storage with PostgreSQL
  const PgSession = ConnectPgSimple(session);

  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: THIRTY_DAYS,
      secure: false, // Set to false for development
      httpOnly: true,
      sameSite: 'lax',
      path: '/'
    },
    store: new PgSession({
      pool,
      // Table name for storing sessions (will be created automatically)
      tableName: 'session',
      createTableIfMissing: true
    })
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport local strategy
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return done(null, false, { message: 'Incorrect email or password' });
      }
      
      // In a real application, we would compare hashed passwords
      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect email or password' });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  // Configure Passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  console.log('Setting up authentication routes...');

  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    console.log('Registration request received:', req.body);
    try {
      const validatedUser = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(validatedUser.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      const user = await storage.createUser(validatedUser);
      
      // Create profile based on user type
      if (user.userType === 'student') {
        await storage.createStudentProfile({
          userId: user.id,
          educationLevel: '',
          institution: '',
          studentType: '',
          interests: []
        });
      } else if (user.userType === 'employer') {
        await storage.createEmployerProfile({
          userId: user.id,
          companyName: validatedUser.firstName + "'s Company", // Default company name
          companyLogo: '',
          companyWebsite: '',
          industry: '',
          companySize: ''
        });
      }
      
      // Log in the user after registration
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error during login", error: err });
        }
        return res.status(201).json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType
        });
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType
        });
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/me', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = req.user as any;
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType
    });
  });

  // User Profile routes
  app.get('/api/profile', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    try {
      let profile;
      if (user.userType === 'student') {
        profile = await storage.getStudentProfileByUserId(user.id);
        if (profile) {
          const skills = await storage.getSkillsByStudentId(profile.id);
          const experiences = await storage.getExperiencesByStudentId(profile.id);
          const educations = await storage.getEducationsByStudentId(profile.id);
          return res.json({ user, profile, skills, experiences, educations });
        }
      } else if (user.userType === 'employer') {
        profile = await storage.getEmployerProfileByUserId(user.id);
        return res.json({ user, profile });
      }
      
      res.status(404).json({ message: "Profile not found" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.put('/api/profile/student', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    if (user.userType !== 'student') {
      return res.status(403).json({ message: "Not a student profile" });
    }
    
    try {
      const profile = await storage.getStudentProfileByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      const validatedProfile = insertStudentProfileSchema.partial().parse(req.body);
      const updatedProfile = await storage.updateStudentProfile(profile.id, validatedProfile);
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.put('/api/profile/employer', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    if (user.userType !== 'employer') {
      return res.status(403).json({ message: "Not an employer profile" });
    }
    
    try {
      const profile = await storage.getEmployerProfileByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ message: "Employer profile not found" });
      }
      
      const validatedProfile = insertEmployerProfileSchema.partial().parse(req.body);
      const updatedProfile = await storage.updateEmployerProfile(profile.id, validatedProfile);
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Skills routes
  app.post('/api/profile/skills', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    if (user.userType !== 'student') {
      return res.status(403).json({ message: "Not a student profile" });
    }
    
    try {
      const profile = await storage.getStudentProfileByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      const validatedSkill = insertSkillSchema.parse({ ...req.body, studentId: profile.id });
      const skill = await storage.createSkill(validatedSkill);
      res.status(201).json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.put('/api/profile/skills/:id', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const skillId = parseInt(req.params.id);
    
    try {
      const profile = await storage.getStudentProfileByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      // Find the skill from student's skills
      const skills = await storage.getSkillsByStudentId(profile.id);
      const skill = skills.find(s => s.id === skillId);
      
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      const validatedSkill = insertSkillSchema.partial().parse(req.body);
      const updatedSkill = await storage.updateSkill(skillId, validatedSkill);
      res.json(updatedSkill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.delete('/api/profile/skills/:id', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const skillId = parseInt(req.params.id);
    
    try {
      const profile = await storage.getStudentProfileByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      // Find the skill from student's skills
      const skills = await storage.getSkillsByStudentId(profile.id);
      const skill = skills.find(s => s.id === skillId);
      
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      await storage.deleteSkill(skillId);
      res.json({ message: "Skill deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Experience routes
  app.post('/api/profile/experiences', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    if (user.userType !== 'student') {
      return res.status(403).json({ message: "Not a student profile" });
    }
    
    try {
      const profile = await storage.getStudentProfileByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      const experienceData = {
        ...req.body,
        studentId: profile.id,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.isCurrent ? null : (req.body.endDate ? new Date(req.body.endDate) : null)
      };
      
      const validatedExperience = insertExperienceSchema.parse(experienceData);
      const experience = await storage.createExperience(validatedExperience);
      res.status(201).json(experience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.put('/api/profile/experiences/:id', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const experienceId = parseInt(req.params.id);
    
    try {
      const profile = await storage.getStudentProfileByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      // Find the experience from student's experiences
      const experiences = await storage.getExperiencesByStudentId(profile.id);
      const experience = experiences.find(e => e.id === experienceId);
      
      if (!experience) {
        return res.status(404).json({ message: "Experience not found" });
      }
      
      const validatedExperience = insertExperienceSchema.partial().parse(req.body);
      const updatedExperience = await storage.updateExperience(experienceId, validatedExperience);
      res.json(updatedExperience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.delete('/api/profile/experiences/:id', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const experienceId = parseInt(req.params.id);
    
    try {
      const profile = await storage.getStudentProfileByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      // Find the experience from student's experiences
      const experiences = await storage.getExperiencesByStudentId(profile.id);
      const experience = experiences.find(e => e.id === experienceId);
      
      if (!experience) {
        return res.status(404).json({ message: "Experience not found" });
      }
      
      await storage.deleteExperience(experienceId);
      res.json({ message: "Experience deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Education routes
  app.post('/api/profile/educations', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    if (user.userType !== 'student') {
      return res.status(403).json({ message: "Not a student profile" });
    }
    
    try {
      const profile = await storage.getStudentProfileByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      const validatedEducation = insertEducationSchema.parse({ ...req.body, studentId: profile.id });
      const education = await storage.createEducation(validatedEducation);
      res.status(201).json(education);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.put('/api/profile/educations/:id', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const educationId = parseInt(req.params.id);
    
    try {
      const profile = await storage.getStudentProfileByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      // Find the education from student's educations
      const educations = await storage.getEducationsByStudentId(profile.id);
      const education = educations.find(e => e.id === educationId);
      
      if (!education) {
        return res.status(404).json({ message: "Education not found" });
      }
      
      const validatedEducation = insertEducationSchema.partial().parse(req.body);
      const updatedEducation = await storage.updateEducation(educationId, validatedEducation);
      res.json(updatedEducation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.delete('/api/profile/educations/:id', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const educationId = parseInt(req.params.id);
    
    try {
      const profile = await storage.getStudentProfileByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      // Find the education from student's educations
      const educations = await storage.getEducationsByStudentId(profile.id);
      const education = educations.find(e => e.id === educationId);
      
      if (!education) {
        return res.status(404).json({ message: "Education not found" });
      }
      
      await storage.deleteEducation(educationId);
      res.json({ message: "Education deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Internship routes
  app.get('/api/internships', async (req, res) => {
    try {
      const internships = await storage.getInternships();
      res.json(internships);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.get('/api/internships/:id', async (req, res) => {
    try {
      const internship = await storage.getInternship(parseInt(req.params.id));
      if (!internship) {
        return res.status(404).json({ message: "Internship not found" });
      }
      res.json(internship);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post('/api/internships', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    if (user.userType !== 'employer') {
      return res.status(403).json({ message: "Not an employer profile" });
    }
    
    try {
      const profile = await storage.getEmployerProfileByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ message: "Employer profile not found" });
      }
      
      const validatedInternship = insertInternshipSchema.parse({ ...req.body, employerId: profile.id });
      const internship = await storage.createInternship(validatedInternship);
      res.status(201).json(internship);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.put('/api/internships/:id', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const internshipId = parseInt(req.params.id);
    
    if (user.userType !== 'employer') {
      return res.status(403).json({ message: "Not an employer profile" });
    }
    
    try {
      const profile = await storage.getEmployerProfileByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ message: "Employer profile not found" });
      }
      
      const internship = await storage.getInternship(internshipId);
      if (!internship || internship.employerId !== profile.id) {
        return res.status(404).json({ message: "Internship not found" });
      }
      
      const validatedInternship = insertInternshipSchema.partial().parse(req.body);
      const updatedInternship = await storage.updateInternship(internshipId, validatedInternship);
      res.json(updatedInternship);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.delete('/api/internships/:id', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const internshipId = parseInt(req.params.id);
    
    if (user.userType !== 'employer') {
      return res.status(403).json({ message: "Not an employer profile" });
    }
    
    try {
      const profile = await storage.getEmployerProfileByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ message: "Employer profile not found" });
      }
      
      const internship = await storage.getInternship(internshipId);
      if (!internship || internship.employerId !== profile.id) {
        return res.status(404).json({ message: "Internship not found" });
      }
      
      await storage.deleteInternship(internshipId);
      res.json({ message: "Internship deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Job routes
  app.get('/api/jobs', async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.get('/api/jobs/:id', async (req, res) => {
    try {
      const job = await storage.getJob(parseInt(req.params.id));
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post('/api/jobs', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    if (user.userType !== 'employer') {
      return res.status(403).json({ message: "Not an employer profile" });
    }
    
    try {
      const profile = await storage.getEmployerProfileByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ message: "Employer profile not found" });
      }
      
      const validatedJob = insertJobSchema.parse({ ...req.body, employerId: profile.id });
      const job = await storage.createJob(validatedJob);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.put('/api/jobs/:id', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const jobId = parseInt(req.params.id);
    
    if (user.userType !== 'employer') {
      return res.status(403).json({ message: "Not an employer profile" });
    }
    
    try {
      const profile = await storage.getEmployerProfileByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ message: "Employer profile not found" });
      }
      
      const job = await storage.getJob(jobId);
      if (!job || job.employerId !== profile.id) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      const validatedJob = insertJobSchema.partial().parse(req.body);
      const updatedJob = await storage.updateJob(jobId, validatedJob);
      res.json(updatedJob);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.delete('/api/jobs/:id', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const jobId = parseInt(req.params.id);
    
    if (user.userType !== 'employer') {
      return res.status(403).json({ message: "Not an employer profile" });
    }
    
    try {
      const profile = await storage.getEmployerProfileByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ message: "Employer profile not found" });
      }
      
      const job = await storage.getJob(jobId);
      if (!job || job.employerId !== profile.id) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      await storage.deleteJob(jobId);
      res.json({ message: "Job deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Course routes
  app.get('/api/courses', async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.get('/api/courses/:id', async (req, res) => {
    try {
      const course = await storage.getCourse(parseInt(req.params.id));
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post('/api/courses', isAuthenticated, async (req, res) => {
    try {
      const validatedCourse = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(validatedCourse);
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.put('/api/courses/:id', isAuthenticated, async (req, res) => {
    const courseId = parseInt(req.params.id);
    
    try {
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      const validatedCourse = insertCourseSchema.partial().parse(req.body);
      const updatedCourse = await storage.updateCourse(courseId, validatedCourse);
      res.json(updatedCourse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.delete('/api/courses/:id', isAuthenticated, async (req, res) => {
    const courseId = parseInt(req.params.id);
    
    try {
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      await storage.deleteCourse(courseId);
      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Application routes
  app.get('/api/applications', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    
    try {
      let applications = [];
      if (user.userType === 'student') {
        const profile = await storage.getStudentProfileByUserId(user.id);
        if (profile) {
          applications = await storage.getApplicationsByStudentId(profile.id);
        }
      } else if (user.userType === 'employer') {
        const profile = await storage.getEmployerProfileByUserId(user.id);
        if (profile) {
          const internships = await storage.getInternships({ employerId: profile.id });
          const jobs = await storage.getJobs({ employerId: profile.id });
          
          for (const internship of internships) {
            const internshipApplications = await storage.getApplicationsByInternshipId(internship.id);
            applications.push(...internshipApplications);
          }
          
          for (const job of jobs) {
            const jobApplications = await storage.getApplicationsByJobId(job.id);
            applications.push(...jobApplications);
          }
        }
      }
      
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post('/api/applications', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    if (user.userType !== 'student') {
      return res.status(403).json({ message: "Not a student profile" });
    }
    
    try {
      const profile = await storage.getStudentProfileByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      const validatedApplication = insertApplicationSchema.parse({ 
        ...req.body, 
        studentId: profile.id,
        applicationDate: new Date().toISOString(),
        status: 'applied'
      });
      
      // Validate that the student is applying to a valid opportunity
      if (validatedApplication.internshipId) {
        const internship = await storage.getInternship(validatedApplication.internshipId);
        if (!internship) {
          return res.status(404).json({ message: "Internship not found" });
        }
      } else if (validatedApplication.jobId) {
        const job = await storage.getJob(validatedApplication.jobId);
        if (!job) {
          return res.status(404).json({ message: "Job not found" });
        }
      } else {
        return res.status(400).json({ message: "Must apply to either an internship or job" });
      }
      
      const application = await storage.createApplication(validatedApplication);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.put('/api/applications/:id', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const applicationId = parseInt(req.params.id);
    
    try {
      const application = await storage.getApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      let authorized = false;
      if (user.userType === 'student') {
        const profile = await storage.getStudentProfileByUserId(user.id);
        if (profile && application.studentId === profile.id) {
          authorized = true;
        }
      } else if (user.userType === 'employer') {
        const profile = await storage.getEmployerProfileByUserId(user.id);
        if (profile) {
          // Check if the application is for an opportunity owned by this employer
          if (application.internshipId) {
            const internship = await storage.getInternship(application.internshipId);
            if (internship && internship.employerId === profile.id) {
              authorized = true;
            }
          } else if (application.jobId) {
            const job = await storage.getJob(application.jobId);
            if (job && job.employerId === profile.id) {
              authorized = true;
            }
          }
        }
      }
      
      if (!authorized) {
        return res.status(403).json({ message: "Not authorized to update this application" });
      }
      
      // Students can only update the cover letter
      let validatedApplication;
      if (user.userType === 'student') {
        validatedApplication = insertApplicationSchema.partial().parse({
          coverLetter: req.body.coverLetter
        });
      } else {
        // Employers can update the status
        validatedApplication = insertApplicationSchema.partial().parse({
          status: req.body.status
        });
      }
      
      const updatedApplication = await storage.updateApplication(applicationId, validatedApplication);
      res.json(updatedApplication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.delete('/api/applications/:id', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const applicationId = parseInt(req.params.id);
    
    try {
      const application = await storage.getApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      if (user.userType === 'student') {
        const profile = await storage.getStudentProfileByUserId(user.id);
        if (!profile || application.studentId !== profile.id) {
          return res.status(403).json({ message: "Not authorized to delete this application" });
        }
      } else {
        return res.status(403).json({ message: "Only students can withdraw applications" });
      }
      
      await storage.deleteApplication(applicationId);
      res.json({ message: "Application withdrawn successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Enrollment routes
  app.get('/api/enrollments', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    
    try {
      let enrollments = [];
      if (user.userType === 'student') {
        const profile = await storage.getStudentProfileByUserId(user.id);
        if (profile) {
          enrollments = await storage.getEnrollmentsByStudentId(profile.id);
        }
      }
      
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post('/api/enrollments', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    if (user.userType !== 'student') {
      return res.status(403).json({ message: "Not a student profile" });
    }
    
    try {
      const profile = await storage.getStudentProfileByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      const validatedEnrollment = insertEnrollmentSchema.parse({ 
        ...req.body, 
        studentId: profile.id,
        enrollmentDate: new Date().toISOString(),
        status: 'active'
      });
      
      // Validate that the course exists
      const course = await storage.getCourse(validatedEnrollment.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if already enrolled
      const enrollments = await storage.getEnrollmentsByStudentId(profile.id);
      const existingEnrollment = enrollments.find(e => e.courseId === validatedEnrollment.courseId);
      if (existingEnrollment) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }
      
      const enrollment = await storage.createEnrollment(validatedEnrollment);
      res.status(201).json(enrollment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.put('/api/enrollments/:id', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const enrollmentId = parseInt(req.params.id);
    
    if (user.userType !== 'student') {
      return res.status(403).json({ message: "Not a student profile" });
    }
    
    try {
      const profile = await storage.getStudentProfileByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      const enrollment = await storage.getEnrollment(enrollmentId);
      if (!enrollment || enrollment.studentId !== profile.id) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      
      const validatedEnrollment = insertEnrollmentSchema.partial().parse({
        status: req.body.status
      });
      
      const updatedEnrollment = await storage.updateEnrollment(enrollmentId, validatedEnrollment);
      res.json(updatedEnrollment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.delete('/api/enrollments/:id', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const enrollmentId = parseInt(req.params.id);
    
    if (user.userType !== 'student') {
      return res.status(403).json({ message: "Not a student profile" });
    }
    
    try {
      const profile = await storage.getStudentProfileByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      const enrollment = await storage.getEnrollment(enrollmentId);
      if (!enrollment || enrollment.studentId !== profile.id) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      
      await storage.deleteEnrollment(enrollmentId);
      res.json({ message: "Enrollment cancelled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  return httpServer;
}