// User types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  contactNumber?: string;
  currentCity?: string;
  gender?: string;
  languages?: string[];
  userType: 'student' | 'employer' | 'admin';
}

export interface StudentProfile {
  id: number;
  userId: number;
  educationLevel?: string;
  institution?: string;
  graduationYear?: number;
  studentType?: string;
  careerObjective?: string;
  resumeUrl?: string;
  interests?: string[];
}

export interface EmployerProfile {
  id: number;
  userId: number;
  companyName: string;
  companyLogo?: string;
  companyWebsite?: string;
  industry?: string;
  companySize?: string;
}

// Resume building blocks
export interface Skill {
  id: number;
  studentId: number;
  skillName: string;
  proficiency?: string;
}

export interface Experience {
  id: number;
  studentId: number;
  title: string;
  company: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  isCurrent?: boolean;
  description?: string;
  type: 'job' | 'internship' | 'project';
}

export interface Education {
  id: number;
  studentId: number;
  degree: string;
  institution: string;
  startYear?: number;
  endYear?: number;
  grade?: string;
  description?: string;
}

// Internship and Job types
export interface Internship {
  id: number;
  employerId: number;
  title: string;
  description: string;
  location?: string;
  isRemote: boolean;
  isPartTime: boolean;
  stipendAmount?: number;
  stipendCurrency: string;
  durationMonths: number;
  startDate?: Date;
  applicationDeadline?: Date;
  skillsRequired?: string[];
  responsibilities?: string[];
  perks?: string[];
  jobOfferPossibility: boolean;
  isActive: boolean;
  employer?: {
    id: number;
    companyName: string;
    companyLogo?: string;
  };
}

export interface Job {
  id: number;
  employerId: number;
  title: string;
  description: string;
  location?: string;
  isRemote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  experienceRequiredYears?: number;
  isFresherJob: boolean;
  skillsRequired?: string[];
  responsibilities?: string[];
  applicationDeadline?: Date;
  isActive: boolean;
  employer?: {
    id: number;
    companyName: string;
    companyLogo?: string;
  };
}

// Application type
export interface Application {
  id: number;
  studentId: number;
  internshipId?: number;
  jobId?: number;
  coverLetter?: string;
  status: 'applied' | 'shortlisted' | 'rejected' | 'hired' | 'interview';
  applicationDate: Date;
  listing?: Internship | Job;
  listingType?: 'internship' | 'job';
  employer?: {
    id: number;
    companyName: string;
    companyLogo?: string;
  };
}

// Course types
export interface Course {
  id: number;
  title: string;
  description: string;
  courseType: 'certification' | 'placement_guarantee';
  durationWeeks: number;
  price: number;
  discountPercentage: number;
  rating?: number;
  learnerCount: number;
  placementGuarantee: boolean;
  placementSalaryMin?: number;
  placementSalaryMax?: number;
  placementType?: 'job' | 'internship';
  placementStipend?: number;
  category: string;
  thumbnail?: string;
}

export interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  paymentId?: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  enrollmentDate: Date;
  completionDate?: Date;
  certificateUrl?: string;
  progressPercentage: number;
  course?: Course;
}

// Filter types
export interface InternshipFilters {
  location?: string;
  isRemote?: boolean;
  isPartTime?: boolean;
  minStipend?: number;
  durationMonths?: number;
  jobOfferPossibility?: boolean;
  skills?: string[];
  searchQuery?: string;
}

export interface JobFilters {
  location?: string;
  isRemote?: boolean;
  minSalary?: number;
  maxSalary?: number;
  experienceRequiredYears?: number;
  isFresherJob?: boolean;
  skills?: string[];
}

export interface CourseFilters {
  courseType?: 'certification' | 'placement_guarantee';
  category?: string;
  maxPrice?: number;
  minRating?: number;
  placementGuarantee?: boolean;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: 'student' | 'employer';
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  profilePicture?: string;
  contactNumber?: string;
  currentCity?: string;
  gender?: string;
  languages?: string[];
}

export interface StudentProfileFormData {
  educationLevel?: string;
  institution?: string;
  graduationYear?: number;
  studentType?: string;
  careerObjective?: string;
  interests?: string[];
}

export interface EmployerProfileFormData {
  companyName: string;
  companyLogo?: string;
  companyWebsite?: string;
  industry?: string;
  companySize?: string;
}

export interface ApplicationFormData {
  internshipId?: number;
  jobId?: number;
  coverLetter?: string;
}

export interface EnrollmentFormData {
  courseId: number;
  paymentId?: string;
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}
