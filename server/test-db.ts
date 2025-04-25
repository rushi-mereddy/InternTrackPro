import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Try to query the users table
    const result = await db.select().from(users).where(eq(users.email, 'demo@example.com'));
    console.log('Database connection successful!');
    console.log('Users table exists and is accessible.');
    console.log('Demo user data:', result);
    
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

testConnection(); 