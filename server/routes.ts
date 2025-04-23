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
import MemoryStore from "memorystore";

// Using a smaller value to avoid TimeoutOverflowWarning
const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 7; // One week instead of 30 days

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup session storage
  const SessionStore = MemoryStore(session);

  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: THIRTY_DAYS
    },
    store: new SessionStore({
      checkPeriod: THIRTY_DAYS
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

  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
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
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
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
      
      const skill = await storage.skills.get(skillId);
      if (!skill || skill.studentId !== profile.id) {
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
      
      const skill = await storage.skills.get(skillId);
      if (!skill || skill.studentId !== profile.id) {
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
      
      const validatedExperience = insertExperienceSchema.parse({ ...req.body, studentId: profile.id });
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
      
      const experience = await storage.experiences.get(experienceId);
      if (!experience || experience.studentId !== profile.id) {
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
      
      const experience = await storage.experiences.get(experienceId);
      if (!experience || experience.studentId !== profile.id) {
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
      
      const education = await storage.educations.get(educationId);
      if (!education || education.studentId !== profile.id) {
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
      
      const education = await storage.educations.get(educationId);
      if (!education || education.studentId !== profile.id) {
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
      
      // Get employer data for each internship
      const internshipsWithEmployer = await Promise.all(
        internships.map(async (internship) => {
          const employer = await storage.getEmployerProfile(internship.employerId);
          return {
            ...internship,
            employer: employer ? {
              id: employer.id,
              companyName: employer.companyName,
              companyLogo: employer.companyLogo
            } : null
          };
        })
      );
      
      res.json(internshipsWithEmployer);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.get('/api/internships/:id', async (req, res) => {
    const internshipId = parseInt(req.params.id);
    
    try {
      const internship = await storage.getInternship(internshipId);
      if (!internship) {
        return res.status(404).json({ message: "Internship not found" });
      }
      
      const employer = await storage.getEmployerProfile(internship.employerId);
      
      res.json({
        ...internship,
        employer: employer ? {
          id: employer.id,
          companyName: employer.companyName,
          companyLogo: employer.companyLogo
        } : null
      });
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
      const employerProfile = await storage.getEmployerProfileByUserId(user.id);
      if (!employerProfile) {
        return res.status(404).json({ message: "Employer profile not found" });
      }
      
      const validatedInternship = insertInternshipSchema.parse({ ...req.body, employerId: employerProfile.id });
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
      const employerProfile = await storage.getEmployerProfileByUserId(user.id);
      if (!employerProfile) {
        return res.status(404).json({ message: "Employer profile not found" });
      }
      
      const internship = await storage.getInternship(internshipId);
      if (!internship || internship.employerId !== employerProfile.id) {
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
      const employerProfile = await storage.getEmployerProfileByUserId(user.id);
      if (!employerProfile) {
        return res.status(404).json({ message: "Employer profile not found" });
      }
      
      const internship = await storage.getInternship(internshipId);
      if (!internship || internship.employerId !== employerProfile.id) {
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
      
      // Get employer data for each job
      const jobsWithEmployer = await Promise.all(
        jobs.map(async (job) => {
          const employer = await storage.getEmployerProfile(job.employerId);
          return {
            ...job,
            employer: employer ? {
              id: employer.id,
              companyName: employer.companyName,
              companyLogo: employer.companyLogo
            } : null
          };
        })
      );
      
      res.json(jobsWithEmployer);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.get('/api/jobs/:id', async (req, res) => {
    const jobId = parseInt(req.params.id);
    
    try {
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      const employer = await storage.getEmployerProfile(job.employerId);
      
      res.json({
        ...job,
        employer: employer ? {
          id: employer.id,
          companyName: employer.companyName,
          companyLogo: employer.companyLogo
        } : null
      });
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
      const employerProfile = await storage.getEmployerProfileByUserId(user.id);
      if (!employerProfile) {
        return res.status(404).json({ message: "Employer profile not found" });
      }
      
      const validatedJob = insertJobSchema.parse({ ...req.body, employerId: employerProfile.id });
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
      const employerProfile = await storage.getEmployerProfileByUserId(user.id);
      if (!employerProfile) {
        return res.status(404).json({ message: "Employer profile not found" });
      }
      
      const job = await storage.getJob(jobId);
      if (!job || job.employerId !== employerProfile.id) {
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
      const employerProfile = await storage.getEmployerProfileByUserId(user.id);
      if (!employerProfile) {
        return res.status(404).json({ message: "Employer profile not found" });
      }
      
      const job = await storage.getJob(jobId);
      if (!job || job.employerId !== employerProfile.id) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      await storage.deleteJob(jobId);
      res.json({ message: "Job deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Application routes
  app.get('/api/applications', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    
    try {
      if (user.userType === 'student') {
        const profile = await storage.getStudentProfileByUserId(user.id);
        if (!profile) {
          return res.status(404).json({ message: "Student profile not found" });
        }
        
        const applications = await storage.getApplicationsByStudentId(profile.id);
        
        // Enrich application data with internship/job info
        const enrichedApplications = await Promise.all(
          applications.map(async (application) => {
            let listing = null;
            let listingType = null;
            let employer = null;
            
            if (application.internshipId) {
              const internship = await storage.getInternship(application.internshipId);
              if (internship) {
                listing = internship;
                listingType = 'internship';
                employer = await storage.getEmployerProfile(internship.employerId);
              }
            } else if (application.jobId) {
              const job = await storage.getJob(application.jobId);
              if (job) {
                listing = job;
                listingType = 'job';
                employer = await storage.getEmployerProfile(job.employerId);
              }
            }
            
            return {
              ...application,
              listing,
              listingType,
              employer: employer ? {
                id: employer.id,
                companyName: employer.companyName,
                companyLogo: employer.companyLogo
              } : null
            };
          })
        );
        
        return res.json(enrichedApplications);
      } else if (user.userType === 'employer') {
        const profile = await storage.getEmployerProfileByUserId(user.id);
        if (!profile) {
          return res.status(404).json({ message: "Employer profile not found" });
        }
        
        // Get all internships and jobs posted by the employer
        const internships = await storage.getInternships({ employerId: profile.id });
        const jobs = await storage.getJobs({ employerId: profile.id });
        
        // Get applications for all internships
        const internshipApplications = await Promise.all(
          internships.map(async (internship) => {
            const applications = await storage.getApplicationsByInternshipId(internship.id);
            return applications.map(application => ({
              ...application,
              listing: internship,
              listingType: 'internship'
            }));
          })
        );
        
        // Get applications for all jobs
        const jobApplications = await Promise.all(
          jobs.map(async (job) => {
            const applications = await storage.getApplicationsByJobId(job.id);
            return applications.map(application => ({
              ...application,
              listing: job,
              listingType: 'job'
            }));
          })
        );
        
        // Combine and enrich with student data
        const allApplications = [...internshipApplications.flat(), ...jobApplications.flat()];
        const enrichedApplications = await Promise.all(
          allApplications.map(async (application) => {
            const studentProfile = await storage.getStudentProfile(application.studentId);
            const user = studentProfile ? await storage.getUser(studentProfile.userId) : null;
            
            return {
              ...application,
              student: studentProfile ? {
                ...studentProfile,
                firstName: user?.firstName,
                lastName: user?.lastName,
                email: user?.email
              } : null
            };
          })
        );
        
        return res.json(enrichedApplications);
      }
      
      return res.status(403).json({ message: "Unauthorized user type" });
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
      
      // Validate that only one of internshipId or jobId is provided
      if (req.body.internshipId && req.body.jobId) {
        return res.status(400).json({ message: "Cannot apply to both internship and job in the same application" });
      }
      
      if (!req.body.internshipId && !req.body.jobId) {
        return res.status(400).json({ message: "Must apply to either an internship or a job" });
      }
      
      // If applying to an internship, check if it exists
      if (req.body.internshipId) {
        const internship = await storage.getInternship(req.body.internshipId);
        if (!internship) {
          return res.status(404).json({ message: "Internship not found" });
        }
      }
      
      // If applying to a job, check if it exists
      if (req.body.jobId) {
        const job = await storage.getJob(req.body.jobId);
        if (!job) {
          return res.status(404).json({ message: "Job not found" });
        }
      }
      
      // Check if student has already applied
      const existingApplications = await storage.getApplicationsByStudentId(profile.id);
      const alreadyApplied = existingApplications.some(app => 
        (app.internshipId && app.internshipId === req.body.internshipId) || 
        (app.jobId && app.jobId === req.body.jobId)
      );
      
      if (alreadyApplied) {
        return res.status(400).json({ message: "You have already applied to this opportunity" });
      }
      
      const validatedApplication = insertApplicationSchema.parse({
        ...req.body,
        studentId: profile.id
      });
      
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
      
      if (user.userType === 'student') {
        const profile = await storage.getStudentProfileByUserId(user.id);
        if (!profile || profile.id !== application.studentId) {
          return res.status(403).json({ message: "Not authorized to update this application" });
        }
        
        // Students can only update their cover letter
        const validatedUpdate = insertApplicationSchema.partial().parse({
          coverLetter: req.body.coverLetter
        });
        
        const updatedApplication = await storage.updateApplication(applicationId, validatedUpdate);
        return res.json(updatedApplication);
      } else if (user.userType === 'employer') {
        const profile = await storage.getEmployerProfileByUserId(user.id);
        if (!profile) {
          return res.status(404).json({ message: "Employer profile not found" });
        }
        
        // Verify that the employer owns the internship/job
        let isEmployerOfListing = false;
        
        if (application.internshipId) {
          const internship = await storage.getInternship(application.internshipId);
          isEmployerOfListing = internship?.employerId === profile.id;
        } else if (application.jobId) {
          const job = await storage.getJob(application.jobId);
          isEmployerOfListing = job?.employerId === profile.id;
        }
        
        if (!isEmployerOfListing) {
          return res.status(403).json({ message: "Not authorized to update this application" });
        }
        
        // Employers can only update the status
        const validatedUpdate = insertApplicationSchema.partial().parse({
          status: req.body.status
        });
        
        const updatedApplication = await storage.updateApplication(applicationId, validatedUpdate);
        return res.json(updatedApplication);
      }
      
      return res.status(403).json({ message: "Not authorized" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Course routes
  app.get('/api/courses', async (req, res) => {
    try {
      const courseType = req.query.type as string;
      let courses;
      
      if (courseType) {
        courses = await storage.getCourses({ courseType });
      } else {
        courses = await storage.getCourses();
      }
      
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.get('/api/courses/:id', async (req, res) => {
    const courseId = parseInt(req.params.id);
    
    try {
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Enrollment routes
  app.get('/api/enrollments', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    if (user.userType !== 'student') {
      return res.status(403).json({ message: "Not a student profile" });
    }
    
    try {
      const profile = await storage.getStudentProfileByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      const enrollments = await storage.getEnrollmentsByStudentId(profile.id);
      
      // Enrich enrollment data with course info
      const enrichedEnrollments = await Promise.all(
        enrollments.map(async (enrollment) => {
          const course = await storage.getCourse(enrollment.courseId);
          return {
            ...enrollment,
            course
          };
        })
      );
      
      res.json(enrichedEnrollments);
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
      
      // Check if the course exists
      const course = await storage.getCourse(req.body.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if already enrolled
      const existingEnrollments = await storage.getEnrollmentsByStudentId(profile.id);
      const alreadyEnrolled = existingEnrollments.some(enrollment => 
        enrollment.courseId === req.body.courseId
      );
      
      if (alreadyEnrolled) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }
      
      const validatedEnrollment = insertEnrollmentSchema.parse({
        ...req.body,
        studentId: profile.id
      });
      
      const enrollment = await storage.createEnrollment(validatedEnrollment);
      res.status(201).json(enrollment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.put('/api/enrollments/:id/progress', isAuthenticated, async (req, res) => {
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
      
      const validatedUpdate = insertEnrollmentSchema.partial().parse({
        progressPercentage: req.body.progressPercentage
      });
      
      // Mark as completed if progress is 100%
      if (validatedUpdate.progressPercentage === 100) {
        validatedUpdate.completionDate = new Date();
      }
      
      const updatedEnrollment = await storage.updateEnrollment(enrollmentId, validatedUpdate);
      res.json(updatedEnrollment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error });
    }
  });

  return httpServer;
}
