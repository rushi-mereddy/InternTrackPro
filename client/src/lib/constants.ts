// Colors
export const COLORS = {
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA'
  },
  secondary: {
    500: '#10B981',
    600: '#059669'
  },
  accent: {
    500: '#F59E0B',
    600: '#D97706'
  }
};

// Company Logos
export const COMPANY_LOGOS = {
  google: 'https://logo.clearbit.com/google.com',
  microsoft: 'https://logo.clearbit.com/microsoft.com',
  amazon: 'https://logo.clearbit.com/amazon.com',
  adobe: 'https://logo.clearbit.com/adobe.com',
  salesforce: 'https://logo.clearbit.com/salesforce.com',
  flipkart: 'https://logo.clearbit.com/flipkart.com',
  facebook: 'https://logo.clearbit.com/facebook.com',
  apple: 'https://logo.clearbit.com/apple.com'
};

// Course Images
export const COURSE_IMAGES = {
  webDevelopment: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159',
  python: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713',
  digitalMarketing: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f5f01a',
  machineLearning: 'https://images.unsplash.com/photo-1580894742597-87bc8789db3d',
  fullStack: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
  dataScience: 'https://images.unsplash.com/photo-1551434678-e076c223a692'
};

// Profile Headshots
export const PROFILE_IMAGES = {
  male1: 'https://randomuser.me/api/portraits/men/1.jpg',
  male2: 'https://randomuser.me/api/portraits/men/2.jpg',
  female1: 'https://randomuser.me/api/portraits/women/1.jpg',
  female2: 'https://randomuser.me/api/portraits/women/2.jpg'
};

// Navigation Items
export const NAV_ITEMS = [
  { label: 'Internships', path: '/internships' },
  { label: 'Jobs', path: '/jobs' },
  { label: 'Courses', path: '/courses', badge: 'OFFER' },
  { label: 'Trainings', path: '/trainings' }
];

// Trending Categories
export const TRENDING_ITEMS = [
  { 
    title: 'Placement Guaranteed Courses',
    description: 'Land your dream job with our placement guarantee programs',
    icon: 'fa-certificate',
    iconBgColor: 'bg-accent-500/10',
    iconColor: 'text-accent-500',
    path: '/courses?type=placement_guarantee'
  },
  { 
    title: 'Certification Courses',
    description: 'Build your skills with industry-recognized certifications',
    icon: 'fa-award',
    iconBgColor: 'bg-secondary-500/10',
    iconColor: 'text-secondary-500',
    badge: 'FLAT 80% OFF',
    path: '/courses?type=certification'
  },
  { 
    title: '1-Day Internship Opportunities',
    description: 'Get real-world experience with quick 1-day internships',
    icon: 'fa-briefcase',
    iconBgColor: 'bg-primary-500/10',
    iconColor: 'text-primary-600',
    path: '/internships?duration=1'
  }
];

// Locations for internships and jobs
export const LOCATIONS = [
  'Bangalore',
  'Mumbai',
  'Delhi',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Gurgaon',
  'Noida',
  'Ahmedabad',
  'Work from Home'
];

// Skills
export const POPULAR_SKILLS = [
  'HTML',
  'CSS',
  'JavaScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'C++',
  'SQL',
  'MongoDB',
  'AWS',
  'Docker',
  'Git',
  'UI/UX Design',
  'Digital Marketing',
  'Content Writing',
  'Data Analysis',
  'Machine Learning',
  'Excel',
  'Communication'
];

// Duration Options
export const DURATION_OPTIONS = [
  { value: '1', label: '1 Month' },
  { value: '2', label: '2 Months' },
  { value: '3', label: '3 Months' },
  { value: '4', label: '4 Months' },
  { value: '5', label: '5 Months' },
  { value: '6', label: '6 Months' },
  { value: '6+', label: '6+ Months' }
];

// Application Status Options
export const APPLICATION_STATUS = [
  { value: 'applied', label: 'Applied' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview', label: 'Interview' },
  { value: 'selected', label: 'Selected' },
  { value: 'rejected', label: 'Rejected' }
];

// User Types
export const USER_TYPES = [
  { value: 'student', label: 'College Student' },
  { value: 'fresher', label: 'Fresher' },
  { value: 'professional', label: 'Working Professional' },
  { value: 'employer', label: 'Employer' }
];

// Languages
export const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'malayalam', label: 'Malayalam' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'punjabi', label: 'Punjabi' }
];

// Stats for homepage
export const PLATFORM_STATS = [
  { number: '5000+', label: 'Active Internships' },
  { number: '2000+', label: 'Partner Companies' },
  { number: '1.5M+', label: 'Registered Students' },
  { number: '100+', label: 'Online Courses' }
];

// Footer links
export const FOOTER_LINKS = {
  internshipsPlaces: [
    { label: 'Internship in India', path: '/internships?location=India' },
    { label: 'Internship in Delhi', path: '/internships?location=Delhi' },
    { label: 'Internship in Bangalore', path: '/internships?location=Bangalore' },
    { label: 'Internship in Hyderabad', path: '/internships?location=Hyderabad' },
    { label: 'Internship in Mumbai', path: '/internships?location=Mumbai' },
    { label: 'Virtual internship', path: '/internships?location=Work%20from%20Home' }
  ],
  internshipsStream: [
    { label: 'Computer Science Internship', path: '/internships?category=Computer%20Science' },
    { label: 'Marketing Internship', path: '/internships?category=Marketing' },
    { label: 'Finance Internship', path: '/internships?category=Finance' },
    { label: 'Summer Research Fellowship', path: '/internships?category=Research' },
    { label: 'Campus Ambassador Program', path: '/internships?category=Campus%20Ambassador' }
  ],
  jobsPlaces: [
    { label: 'Jobs in Delhi', path: '/jobs?location=Delhi' },
    { label: 'Jobs in Mumbai', path: '/jobs?location=Mumbai' },
    { label: 'Jobs in Bangalore', path: '/jobs?location=Bangalore' },
    { label: 'Jobs in Hyderabad', path: '/jobs?location=Hyderabad' },
    { label: 'Jobs in Chennai', path: '/jobs?location=Chennai' }
  ],
  about: [
    { label: 'About us', path: '/about' },
    { label: "We're hiring", path: '/careers' },
    { label: 'Hire interns for your company', path: '/hire' },
    { label: 'Team Diary', path: '/team' },
    { label: 'Blog', path: '/blog' },
    { label: 'Contact us', path: '/contact' }
  ]
};
