import {
  users, User, InsertUser, 
  studentProfiles, StudentProfile, InsertStudentProfile,
  employerProfiles, EmployerProfile, InsertEmployerProfile,
  skills, Skill, InsertSkill,
  experiences, Experience, InsertExperience,
  educations, Education, InsertEducation,
  internships, Internship, InsertInternship,
  jobs, Job, InsertJob,
  applications, Application, InsertApplication,
  courses, Course, InsertCourse,
  enrollments, Enrollment, InsertEnrollment
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;

  // Student Profiles
  getStudentProfile(id: number): Promise<StudentProfile | undefined>;
  getStudentProfileByUserId(userId: number): Promise<StudentProfile | undefined>;
  createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile>;
  updateStudentProfile(id: number, profile: Partial<StudentProfile>): Promise<StudentProfile | undefined>;

  // Employer Profiles
  getEmployerProfile(id: number): Promise<EmployerProfile | undefined>;
  getEmployerProfileByUserId(userId: number): Promise<EmployerProfile | undefined>;
  createEmployerProfile(profile: InsertEmployerProfile): Promise<EmployerProfile>;
  updateEmployerProfile(id: number, profile: Partial<EmployerProfile>): Promise<EmployerProfile | undefined>;

  // Skills
  getSkillsByStudentId(studentId: number): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: Partial<Skill>): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<boolean>;

  // Experiences
  getExperiencesByStudentId(studentId: number): Promise<Experience[]>;
  createExperience(experience: InsertExperience): Promise<Experience>;
  updateExperience(id: number, experience: Partial<Experience>): Promise<Experience | undefined>;
  deleteExperience(id: number): Promise<boolean>;

  // Educations
  getEducationsByStudentId(studentId: number): Promise<Education[]>;
  createEducation(education: InsertEducation): Promise<Education>;
  updateEducation(id: number, education: Partial<Education>): Promise<Education | undefined>;
  deleteEducation(id: number): Promise<boolean>;

  // Internships
  getInternship(id: number): Promise<Internship | undefined>;
  getInternships(filters?: Partial<Internship>): Promise<Internship[]>;
  createInternship(internship: InsertInternship): Promise<Internship>;
  updateInternship(id: number, internship: Partial<Internship>): Promise<Internship | undefined>;
  deleteInternship(id: number): Promise<boolean>;

  // Jobs
  getJob(id: number): Promise<Job | undefined>;
  getJobs(filters?: Partial<Job>): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<Job>): Promise<Job | undefined>;
  deleteJob(id: number): Promise<boolean>;

  // Applications
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationsByStudentId(studentId: number): Promise<Application[]>;
  getApplicationsByInternshipId(internshipId: number): Promise<Application[]>;
  getApplicationsByJobId(jobId: number): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, application: Partial<Application>): Promise<Application | undefined>;
  deleteApplication(id: number): Promise<boolean>;

  // Courses
  getCourse(id: number): Promise<Course | undefined>;
  getCourses(filters?: Partial<Course>): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;

  // Enrollments
  getEnrollment(id: number): Promise<Enrollment | undefined>;
  getEnrollmentsByStudentId(studentId: number): Promise<Enrollment[]>;
  getEnrollmentsByCourseId(courseId: number): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(id: number, enrollment: Partial<Enrollment>): Promise<Enrollment | undefined>;
  deleteEnrollment(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private studentProfiles: Map<number, StudentProfile>;
  private employerProfiles: Map<number, EmployerProfile>;
  private skills: Map<number, Skill>;
  private experiences: Map<number, Experience>;
  private educations: Map<number, Education>;
  private internships: Map<number, Internship>;
  private jobs: Map<number, Job>;
  private applications: Map<number, Application>;
  private courses: Map<number, Course>;
  private enrollments: Map<number, Enrollment>;

  private userIdCounter: number;
  private studentProfileIdCounter: number;
  private employerProfileIdCounter: number;
  private skillIdCounter: number;
  private experienceIdCounter: number;
  private educationIdCounter: number;
  private internshipIdCounter: number;
  private jobIdCounter: number;
  private applicationIdCounter: number;
  private courseIdCounter: number;
  private enrollmentIdCounter: number;

  constructor() {
    this.users = new Map();
    this.studentProfiles = new Map();
    this.employerProfiles = new Map();
    this.skills = new Map();
    this.experiences = new Map();
    this.educations = new Map();
    this.internships = new Map();
    this.jobs = new Map();
    this.applications = new Map();
    this.courses = new Map();
    this.enrollments = new Map();

    this.userIdCounter = 1;
    this.studentProfileIdCounter = 1;
    this.employerProfileIdCounter = 1;
    this.skillIdCounter = 1;
    this.experienceIdCounter = 1;
    this.educationIdCounter = 1;
    this.internshipIdCounter = 1;
    this.jobIdCounter = 1;
    this.applicationIdCounter = 1;
    this.courseIdCounter = 1;
    this.enrollmentIdCounter = 1;

    // Initialize with seed data
    this.initializeSeedData();
  }

  private initializeSeedData() {
    // Create sample courses
    const courses = [
      {
        title: "Web Development",
        description: "Learn HTML, CSS, JavaScript, React and Node.js to become a full-stack web developer.",
        courseType: "certification",
        durationWeeks: 8,
        price: 9999,
        discountPercentage: 80,
        rating: 41, // 4.1/5
        learnerCount: 121587,
        category: "programming",
        thumbnail: "https://images.unsplash.com/photo-1587620962725-abab7fe55159",
      },
      {
        title: "Programming with Python",
        description: "Master Python programming from the basics to advanced topics including data science.",
        courseType: "certification",
        durationWeeks: 6,
        price: 7999,
        discountPercentage: 80,
        rating: 42, // 4.2/5
        learnerCount: 87848,
        category: "programming",
        thumbnail: "https://images.unsplash.com/photo-1542831371-29b0f74f9713",
      },
      {
        title: "Digital Marketing",
        description: "Learn social media marketing, SEO, content strategy, and online advertising.",
        courseType: "certification",
        durationWeeks: 8,
        price: 8999,
        discountPercentage: 80,
        rating: 44, // 4.4/5
        learnerCount: 64000,
        category: "marketing",
        thumbnail: "https://images.unsplash.com/photo-1432888622747-4eb9a8f5f01a",
      },
      {
        title: "Machine Learning",
        description: "Learn algorithms, neural networks, and apply ML to real-world problems.",
        courseType: "certification",
        durationWeeks: 8,
        price: 11999,
        discountPercentage: 80,
        rating: 45, // 4.5/5
        learnerCount: 37213,
        category: "data_science",
        thumbnail: "https://images.unsplash.com/photo-1580894742597-87bc8789db3d",
      },
      {
        title: "Full Stack Development",
        description: "Comprehensive program with guaranteed job placement and industry mentorship.",
        courseType: "placement_guarantee",
        durationWeeks: 16, // 4 months
        price: 49999,
        discountPercentage: 0,
        rating: 46, // 4.6/5
        learnerCount: 25000,
        placementGuarantee: true,
        placementSalaryMin: 300000,
        placementSalaryMax: 1000000,
        placementType: "job",
        category: "programming",
        thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      },
      {
        title: "Data Science",
        description: "Master data analysis with guaranteed internship placement at top companies.",
        courseType: "placement_guarantee",
        durationWeeks: 24, // 6 months
        price: 39999,
        discountPercentage: 0,
        rating: 45, // 4.5/5
        learnerCount: 18000,
        placementGuarantee: true,
        placementType: "internship",
        placementStipend: 40000,
        category: "data_science",
        thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692",
      }
    ];

    // Insert course data
    courses.forEach(course => {
      const id = this.courseIdCounter++;
      this.courses.set(id, { ...course, id } as Course);
    });

    // Create sample employer profiles
    const employers = [
      {
        id: this.employerProfileIdCounter++,
        userId: 0, // Placeholder
        companyName: "Google",
        companyLogo: "https://logo.clearbit.com/google.com",
        companyWebsite: "https://google.com",
        industry: "Technology",
        companySize: "10000+",
      },
      {
        id: this.employerProfileIdCounter++,
        userId: 0, // Placeholder
        companyName: "Microsoft",
        companyLogo: "https://logo.clearbit.com/microsoft.com",
        companyWebsite: "https://microsoft.com",
        industry: "Technology",
        companySize: "10000+",
      },
      {
        id: this.employerProfileIdCounter++,
        userId: 0, // Placeholder
        companyName: "Amazon",
        companyLogo: "https://logo.clearbit.com/amazon.com",
        companyWebsite: "https://amazon.com",
        industry: "E-commerce",
        companySize: "10000+",
      },
      {
        id: this.employerProfileIdCounter++,
        userId: 0, // Placeholder
        companyName: "Adobe",
        companyLogo: "https://logo.clearbit.com/adobe.com",
        companyWebsite: "https://adobe.com",
        industry: "Software",
        companySize: "10000+",
      },
      {
        id: this.employerProfileIdCounter++,
        userId: 0, // Placeholder
        companyName: "Salesforce",
        companyLogo: "https://logo.clearbit.com/salesforce.com",
        companyWebsite: "https://salesforce.com",
        industry: "Software",
        companySize: "10000+",
      },
      {
        id: this.employerProfileIdCounter++,
        userId: 0, // Placeholder
        companyName: "Flipkart",
        companyLogo: "https://logo.clearbit.com/flipkart.com",
        companyWebsite: "https://flipkart.com",
        industry: "E-commerce",
        companySize: "10000+",
      }
    ];

    // Insert employer data
    employers.forEach(employer => {
      this.employerProfiles.set(employer.id, employer as EmployerProfile);
    });

    // Create sample internships
    const internships = [
      {
        id: this.internshipIdCounter++,
        employerId: 1, // Google
        title: "Web Development Intern",
        description: "Join our team to develop web applications using modern technologies.",
        location: "Work from Home",
        isRemote: true,
        isPartTime: false,
        stipendAmount: 10000,
        stipendCurrency: "INR",
        durationMonths: 3,
        startDate: new Date("2023-07-01"),
        applicationDeadline: new Date("2023-06-20"),
        skillsRequired: ["HTML", "CSS", "JavaScript", "React"],
        responsibilities: [
          "Develop responsive web applications",
          "Collaborate with the design team",
          "Optimize application performance",
          "Learn and implement best practices"
        ],
        perks: ["Certificate", "Letter of Recommendation", "Flexible Work Hours"],
        jobOfferPossibility: true,
        isActive: true,
      },
      {
        id: this.internshipIdCounter++,
        employerId: 2, // Microsoft
        title: "Data Science Intern",
        description: "Work on real-world data science projects and gain hands-on experience.",
        location: "Bangalore",
        isRemote: false,
        isPartTime: false,
        stipendAmount: 25000,
        stipendCurrency: "INR",
        durationMonths: 6,
        startDate: new Date("2023-07-01"),
        applicationDeadline: new Date("2023-06-15"),
        skillsRequired: ["Python", "SQL", "Machine Learning"],
        responsibilities: [
          "Analyze large datasets",
          "Build predictive models",
          "Implement machine learning algorithms",
          "Present findings to stakeholders"
        ],
        perks: ["Certificate", "Pre-Placement Offer", "Mentorship"],
        jobOfferPossibility: true,
        isActive: true,
      },
      {
        id: this.internshipIdCounter++,
        employerId: 3, // Amazon
        title: "Marketing Intern",
        description: "Join our marketing team to learn about digital marketing strategies.",
        location: "Mumbai",
        isRemote: false,
        isPartTime: true,
        stipendAmount: 15000,
        stipendCurrency: "INR",
        durationMonths: 4,
        startDate: new Date("2023-07-01"),
        applicationDeadline: new Date("2023-06-25"),
        skillsRequired: ["Social Media", "Content Creation", "Analytics"],
        responsibilities: [
          "Create social media content",
          "Analyze campaign performance",
          "Research market trends",
          "Assist in planning marketing strategies"
        ],
        perks: ["Certificate", "Networking Opportunities", "Performance Bonus"],
        jobOfferPossibility: false,
        isActive: true,
      }
    ];

    // Insert internship data
    internships.forEach(internship => {
      this.internships.set(internship.id, internship as Internship);
    });

    // Create sample jobs
    const jobs = [
      {
        id: this.jobIdCounter++,
        employerId: 4, // Adobe
        title: "UI/UX Designer",
        description: "Join our design team to create beautiful user interfaces and experiences.",
        location: "Bangalore",
        isRemote: false,
        salaryMin: 600000,
        salaryMax: 1000000,
        salaryCurrency: "INR",
        experienceRequiredYears: 0,
        isFresherJob: true,
        skillsRequired: ["UI Design", "Figma", "Prototyping"],
        responsibilities: [
          "Create user-centered designs",
          "Develop wireframes and prototypes",
          "Collaborate with developers",
          "Conduct usability testing"
        ],
        applicationDeadline: new Date("2023-06-30"),
        isActive: true,
      },
      {
        id: this.jobIdCounter++,
        employerId: 5, // Salesforce
        title: "Software Developer",
        description: "Join our engineering team to build innovative solutions.",
        location: "Hyderabad",
        isRemote: false,
        salaryMin: 400000,
        salaryMax: 700000,
        salaryCurrency: "INR",
        experienceRequiredYears: 0,
        isFresherJob: true,
        skillsRequired: ["Java", "Spring Boot", "JavaScript"],
        responsibilities: [
          "Develop high-quality software",
          "Participate in code reviews",
          "Fix bugs and improve application performance",
          "Write clean, maintainable code"
        ],
        applicationDeadline: new Date("2023-06-28"),
        isActive: true,
      },
      {
        id: this.jobIdCounter++,
        employerId: 6, // Flipkart
        title: "Data Analyst",
        description: "Analyze data to drive business decisions and strategy.",
        location: "Work from Home",
        isRemote: true,
        salaryMin: 500000,
        salaryMax: 800000,
        salaryCurrency: "INR",
        experienceRequiredYears: 1,
        isFresherJob: false,
        skillsRequired: ["SQL", "Python", "Tableau", "Excel"],
        responsibilities: [
          "Analyze data and create reports",
          "Build and maintain dashboards",
          "Identify trends and patterns",
          "Support data-driven decision making"
        ],
        applicationDeadline: new Date("2023-06-22"),
        isActive: true,
      }
    ];

    // Insert job data
    jobs.forEach(job => {
      this.jobs.set(job.id, job as Job);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Student Profiles
  async getStudentProfile(id: number): Promise<StudentProfile | undefined> {
    return this.studentProfiles.get(id);
  }

  async getStudentProfileByUserId(userId: number): Promise<StudentProfile | undefined> {
    for (const profile of this.studentProfiles.values()) {
      if (profile.userId === userId) {
        return profile;
      }
    }
    return undefined;
  }

  async createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile> {
    const id = this.studentProfileIdCounter++;
    const newProfile = { ...profile, id, createdAt: new Date() };
    this.studentProfiles.set(id, newProfile);
    return newProfile;
  }

  async updateStudentProfile(id: number, profile: Partial<StudentProfile>): Promise<StudentProfile | undefined> {
    const existingProfile = this.studentProfiles.get(id);
    if (!existingProfile) return undefined;
    
    const updatedProfile = { ...existingProfile, ...profile };
    this.studentProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  // Employer Profiles
  async getEmployerProfile(id: number): Promise<EmployerProfile | undefined> {
    return this.employerProfiles.get(id);
  }

  async getEmployerProfileByUserId(userId: number): Promise<EmployerProfile | undefined> {
    for (const profile of this.employerProfiles.values()) {
      if (profile.userId === userId) {
        return profile;
      }
    }
    return undefined;
  }

  async createEmployerProfile(profile: InsertEmployerProfile): Promise<EmployerProfile> {
    const id = this.employerProfileIdCounter++;
    const newProfile = { ...profile, id, createdAt: new Date() };
    this.employerProfiles.set(id, newProfile);
    return newProfile;
  }

  async updateEmployerProfile(id: number, profile: Partial<EmployerProfile>): Promise<EmployerProfile | undefined> {
    const existingProfile = this.employerProfiles.get(id);
    if (!existingProfile) return undefined;
    
    const updatedProfile = { ...existingProfile, ...profile };
    this.employerProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  // Skills
  async getSkillsByStudentId(studentId: number): Promise<Skill[]> {
    const studentSkills: Skill[] = [];
    for (const skill of this.skills.values()) {
      if (skill.studentId === studentId) {
        studentSkills.push(skill);
      }
    }
    return studentSkills;
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const id = this.skillIdCounter++;
    const newSkill = { ...skill, id };
    this.skills.set(id, newSkill);
    return newSkill;
  }

  async updateSkill(id: number, skill: Partial<Skill>): Promise<Skill | undefined> {
    const existingSkill = this.skills.get(id);
    if (!existingSkill) return undefined;
    
    const updatedSkill = { ...existingSkill, ...skill };
    this.skills.set(id, updatedSkill);
    return updatedSkill;
  }

  async deleteSkill(id: number): Promise<boolean> {
    return this.skills.delete(id);
  }

  // Experiences
  async getExperiencesByStudentId(studentId: number): Promise<Experience[]> {
    const studentExperiences: Experience[] = [];
    for (const experience of this.experiences.values()) {
      if (experience.studentId === studentId) {
        studentExperiences.push(experience);
      }
    }
    return studentExperiences;
  }

  async createExperience(experience: InsertExperience): Promise<Experience> {
    const id = this.experienceIdCounter++;
    const newExperience = { ...experience, id };
    this.experiences.set(id, newExperience);
    return newExperience;
  }

  async updateExperience(id: number, experience: Partial<Experience>): Promise<Experience | undefined> {
    const existingExperience = this.experiences.get(id);
    if (!existingExperience) return undefined;
    
    const updatedExperience = { ...existingExperience, ...experience };
    this.experiences.set(id, updatedExperience);
    return updatedExperience;
  }

  async deleteExperience(id: number): Promise<boolean> {
    return this.experiences.delete(id);
  }

  // Educations
  async getEducationsByStudentId(studentId: number): Promise<Education[]> {
    const studentEducations: Education[] = [];
    for (const education of this.educations.values()) {
      if (education.studentId === studentId) {
        studentEducations.push(education);
      }
    }
    return studentEducations;
  }

  async createEducation(education: InsertEducation): Promise<Education> {
    const id = this.educationIdCounter++;
    const newEducation = { ...education, id };
    this.educations.set(id, newEducation);
    return newEducation;
  }

  async updateEducation(id: number, education: Partial<Education>): Promise<Education | undefined> {
    const existingEducation = this.educations.get(id);
    if (!existingEducation) return undefined;
    
    const updatedEducation = { ...existingEducation, ...education };
    this.educations.set(id, updatedEducation);
    return updatedEducation;
  }

  async deleteEducation(id: number): Promise<boolean> {
    return this.educations.delete(id);
  }

  // Internships
  async getInternship(id: number): Promise<Internship | undefined> {
    return this.internships.get(id);
  }

  async getInternships(filters?: Partial<Internship>): Promise<Internship[]> {
    if (!filters) return Array.from(this.internships.values());
    
    return Array.from(this.internships.values()).filter(internship => {
      for (const [key, value] of Object.entries(filters)) {
        // Skip undefined values in the filter
        if (value === undefined) continue;
        
        // Special case for arrays like skillsRequired
        if (Array.isArray(internship[key as keyof Internship]) && Array.isArray(value)) {
          const internshipArray = internship[key as keyof Internship] as unknown as any[];
          const filterArray = value as unknown as any[];
          if (!filterArray.every(item => internshipArray.includes(item))) {
            return false;
          }
          continue;
        }
        
        // For primitive values, direct comparison
        if (internship[key as keyof Internship] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  async createInternship(internship: InsertInternship): Promise<Internship> {
    const id = this.internshipIdCounter++;
    const newInternship = { ...internship, id, createdAt: new Date() };
    this.internships.set(id, newInternship);
    return newInternship;
  }

  async updateInternship(id: number, internship: Partial<Internship>): Promise<Internship | undefined> {
    const existingInternship = this.internships.get(id);
    if (!existingInternship) return undefined;
    
    const updatedInternship = { ...existingInternship, ...internship };
    this.internships.set(id, updatedInternship);
    return updatedInternship;
  }

  async deleteInternship(id: number): Promise<boolean> {
    return this.internships.delete(id);
  }

  // Jobs
  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getJobs(filters?: Partial<Job>): Promise<Job[]> {
    if (!filters) return Array.from(this.jobs.values());
    
    return Array.from(this.jobs.values()).filter(job => {
      for (const [key, value] of Object.entries(filters)) {
        // Skip undefined values in the filter
        if (value === undefined) continue;
        
        // Special case for arrays like skillsRequired
        if (Array.isArray(job[key as keyof Job]) && Array.isArray(value)) {
          const jobArray = job[key as keyof Job] as unknown as any[];
          const filterArray = value as unknown as any[];
          if (!filterArray.every(item => jobArray.includes(item))) {
            return false;
          }
          continue;
        }
        
        // For primitive values, direct comparison
        if (job[key as keyof Job] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  async createJob(job: InsertJob): Promise<Job> {
    const id = this.jobIdCounter++;
    const newJob = { ...job, id, createdAt: new Date() };
    this.jobs.set(id, newJob);
    return newJob;
  }

  async updateJob(id: number, job: Partial<Job>): Promise<Job | undefined> {
    const existingJob = this.jobs.get(id);
    if (!existingJob) return undefined;
    
    const updatedJob = { ...existingJob, ...job };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  async deleteJob(id: number): Promise<boolean> {
    return this.jobs.delete(id);
  }

  // Applications
  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async getApplicationsByStudentId(studentId: number): Promise<Application[]> {
    const studentApplications: Application[] = [];
    for (const application of this.applications.values()) {
      if (application.studentId === studentId) {
        studentApplications.push(application);
      }
    }
    return studentApplications;
  }

  async getApplicationsByInternshipId(internshipId: number): Promise<Application[]> {
    const internshipApplications: Application[] = [];
    for (const application of this.applications.values()) {
      if (application.internshipId === internshipId) {
        internshipApplications.push(application);
      }
    }
    return internshipApplications;
  }

  async getApplicationsByJobId(jobId: number): Promise<Application[]> {
    const jobApplications: Application[] = [];
    for (const application of this.applications.values()) {
      if (application.jobId === jobId) {
        jobApplications.push(application);
      }
    }
    return jobApplications;
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const id = this.applicationIdCounter++;
    const newApplication = { ...application, id, applicationDate: new Date() };
    this.applications.set(id, newApplication);
    return newApplication;
  }

  async updateApplication(id: number, application: Partial<Application>): Promise<Application | undefined> {
    const existingApplication = this.applications.get(id);
    if (!existingApplication) return undefined;
    
    const updatedApplication = { ...existingApplication, ...application };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }

  async deleteApplication(id: number): Promise<boolean> {
    return this.applications.delete(id);
  }

  // Courses
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCourses(filters?: Partial<Course>): Promise<Course[]> {
    if (!filters) return Array.from(this.courses.values());
    
    return Array.from(this.courses.values()).filter(course => {
      for (const [key, value] of Object.entries(filters)) {
        // Skip undefined values in the filter
        if (value === undefined) continue;
        
        // For primitive values, direct comparison
        if (course[key as keyof Course] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const id = this.courseIdCounter++;
    const newCourse = { ...course, id, createdAt: new Date() };
    this.courses.set(id, newCourse);
    return newCourse;
  }

  async updateCourse(id: number, course: Partial<Course>): Promise<Course | undefined> {
    const existingCourse = this.courses.get(id);
    if (!existingCourse) return undefined;
    
    const updatedCourse = { ...existingCourse, ...course };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<boolean> {
    return this.courses.delete(id);
  }

  // Enrollments
  async getEnrollment(id: number): Promise<Enrollment | undefined> {
    return this.enrollments.get(id);
  }

  async getEnrollmentsByStudentId(studentId: number): Promise<Enrollment[]> {
    const studentEnrollments: Enrollment[] = [];
    for (const enrollment of this.enrollments.values()) {
      if (enrollment.studentId === studentId) {
        studentEnrollments.push(enrollment);
      }
    }
    return studentEnrollments;
  }

  async getEnrollmentsByCourseId(courseId: number): Promise<Enrollment[]> {
    const courseEnrollments: Enrollment[] = [];
    for (const enrollment of this.enrollments.values()) {
      if (enrollment.courseId === courseId) {
        courseEnrollments.push(enrollment);
      }
    }
    return courseEnrollments;
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const id = this.enrollmentIdCounter++;
    const newEnrollment = { ...enrollment, id, enrollmentDate: new Date() };
    this.enrollments.set(id, newEnrollment);
    return newEnrollment;
  }

  async updateEnrollment(id: number, enrollment: Partial<Enrollment>): Promise<Enrollment | undefined> {
    const existingEnrollment = this.enrollments.get(id);
    if (!existingEnrollment) return undefined;
    
    const updatedEnrollment = { ...existingEnrollment, ...enrollment };
    this.enrollments.set(id, updatedEnrollment);
    return updatedEnrollment;
  }

  async deleteEnrollment(id: number): Promise<boolean> {
    return this.enrollments.delete(id);
  }
}

export const storage = new MemStorage();
