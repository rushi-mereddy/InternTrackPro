import { db } from './db';
import { users, employerProfiles } from '../shared/schema';

async function seedEmployer() {
  try {
    // First create a user
    const [user] = await db.insert(users).values({
      email: 'employer@example.com',
      password: 'hashed_password', // In a real app, this should be properly hashed
      firstName: 'Tech',
      lastName: 'Corp',
      userType: 'employer'
    }).returning();

    // Then create the employer profile
    const [employer] = await db.insert(employerProfiles).values({
      userId: user.id,
      companyName: 'Tech Corporation',
      companyWebsite: 'https://techcorp.example.com',
      industry: 'Technology',
      companySize: '100-500',
    }).returning();

    console.log('Successfully created employer with ID:', employer.id);
    return employer.id;
  } catch (error) {
    console.error('Error seeding employer:', error);
    throw error;
  }
}

seedEmployer(); 