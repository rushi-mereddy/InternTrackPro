import { db } from './db';
import { internships } from '../shared/schema';
import { eq } from 'drizzle-orm';

const sampleInternships = [
  {
    employerId: 1, // Make sure this employer exists in your database
    title: "Software Development Intern",
    description: "Join our team as a Software Development Intern and work on cutting-edge web applications. You'll collaborate with experienced developers and learn modern technologies.",
    location: "Bangalore",
    isRemote: false,
    isPartTime: false,
    stipendAmount: 20000,
    stipendCurrency: "INR",
    durationMonths: 6,
    startDate: "2024-06-01",
    applicationDeadline: "2024-05-15",
    skillsRequired: ["JavaScript", "React", "Node.js", "HTML", "CSS"],
    responsibilities: [
      "Develop and maintain web applications",
      "Write clean and efficient code",
      "Participate in code reviews",
      "Collaborate with team members"
    ],
    perks: [
      "Certificate of completion",
      "Letter of recommendation",
      "Flexible work hours",
      "Learning and development opportunities"
    ],
    jobOfferPossibility: true,
    isActive: true
  },
  {
    employerId: 1,
    title: "Data Science Intern",
    description: "Work with our data science team to analyze large datasets and build machine learning models. Gain hands-on experience with real-world data problems.",
    location: "Mumbai",
    isRemote: true,
    isPartTime: true,
    stipendAmount: 15000,
    stipendCurrency: "INR",
    durationMonths: 3,
    startDate: "2024-05-01",
    applicationDeadline: "2024-04-20",
    skillsRequired: ["Python", "Machine Learning", "Data Analysis", "SQL", "Statistics"],
    responsibilities: [
      "Analyze and process large datasets",
      "Build and evaluate machine learning models",
      "Create data visualizations",
      "Document findings and insights"
    ],
    perks: [
      "Remote work flexibility",
      "Mentorship from experienced data scientists",
      "Access to premium learning resources",
      "Networking opportunities"
    ],
    jobOfferPossibility: true,
    isActive: true
  },
  {
    employerId: 1,
    title: "Marketing Intern",
    description: "Join our marketing team and help create engaging content, manage social media, and develop marketing strategies for our products.",
    location: "Delhi",
    isRemote: false,
    isPartTime: true,
    stipendAmount: 10000,
    stipendCurrency: "INR",
    durationMonths: 4,
    startDate: "2024-07-01",
    applicationDeadline: "2024-06-15",
    skillsRequired: ["Content Writing", "Social Media", "Digital Marketing", "Analytics", "Creativity"],
    responsibilities: [
      "Create social media content",
      "Assist in marketing campaigns",
      "Conduct market research",
      "Help with email marketing"
    ],
    perks: [
      "Hands-on marketing experience",
      "Portfolio building opportunities",
      "Industry networking",
      "Performance-based incentives"
    ],
    jobOfferPossibility: true,
    isActive: true
  }
];

async function seedInternships() {
  try {
    // First, delete any existing internships
    await db.delete(internships);
    
    // Insert all internships at once
    await db.insert(internships).values(sampleInternships);
    
    console.log("Successfully seeded internships!");
  } catch (error) {
    console.error("Error seeding internships:", error);
  }
}

seedInternships(); 