import { db } from './db';
import { employerProfiles } from '../shared/schema';

async function checkEmployers() {
  try {
    const employers = await db.select().from(employerProfiles);
    console.log('Existing employers:', employers);
    
    if (employers.length === 0) {
      console.log('No employers found in the database. You need to create an employer profile first.');
    } else {
      console.log('Available employer IDs:', employers.map(e => e.id));
    }
  } catch (error) {
    console.error('Error checking employers:', error);
  }
}

checkEmployers(); 