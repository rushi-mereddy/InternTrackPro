# Technical Specification for Internshala-like Platform

## System Architecture

### Recommended Technology Stack
- **Frontend**: Next.js with React (for better SEO and performance)
- **CSS Framework**: Tailwind CSS (for responsive design)
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL (relational database for structured data)
- **Authentication**: JWT with OAuth integration
- **Cloud Services**: AWS/GCP for hosting
- **Email Service**: SendGrid/Mailchimp for notifications
- **Search**: Elasticsearch for advanced filtering
- **CDN**: Cloudflare for content delivery
- **Payment Gateway**: Razorpay/Stripe for course payments

### System Components
1. **User Service**: Handles authentication, authorization, and user management
2. **Internship Service**: Manages internship listings, applications, and filtering
3. **Job Service**: Manages job listings, applications, and filtering
4. **Training Service**: Handles course management, enrollment, and learning content
5. **Notification Service**: Manages all system notifications
6. **Search Service**: Provides advanced search and filtering capabilities
7. **Payment Service**: Handles payment processing for courses
8. **Analytics Service**: Tracks user behavior and system metrics

## Database Schema

### Core Tables

#### Users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  profile_picture_url VARCHAR(255),
  contact_number VARCHAR(20),
  current_city VARCHAR(100),
  gender VARCHAR(20),
  user_type VARCHAR(50) NOT NULL, -- student, employer, admin
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Student Profiles
```sql
CREATE TABLE student_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  education_level VARCHAR(100),
  institution VARCHAR(255),
  graduation_year INTEGER,
  resume_url VARCHAR(255),
  career_objective TEXT,
  languages JSON, -- Array of languages known
  student_type VARCHAR(50), -- college student, fresher, working professional, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Employer Profiles
```sql
CREATE TABLE employer_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  company_name VARCHAR(255) NOT NULL,
  company_logo_url VARCHAR(255),
  company_website VARCHAR(255),
  industry VARCHAR(100),
  company_size VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Internships
```sql
CREATE TABLE internships (
  id SERIAL PRIMARY KEY,
  employer_id INTEGER REFERENCES employer_profiles(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(100),
  is_remote BOOLEAN DEFAULT FALSE,
  is_part_time BOOLEAN DEFAULT FALSE,
  stipend_amount INTEGER,
  stipend_currency VARCHAR(10) DEFAULT 'INR',
  duration_months INTEGER NOT NULL,
  start_date DATE,
  application_deadline DATE,
  skills_required TEXT[],
  responsibilities TEXT[],
  perks TEXT[],
  job_offer_possibility BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Jobs
```sql
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  employer_id INTEGER REFERENCES employer_profiles(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(100),
  is_remote BOOLEAN DEFAULT FALSE,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency VARCHAR(10) DEFAULT 'INR',
  experience_required_years INTEGER,
  is_fresher_job BOOLEAN DEFAULT FALSE,
  skills_required TEXT[],
  responsibilities TEXT[],
  application_deadline DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Applications
```sql
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES student_profiles(id),
  internship_id INTEGER REFERENCES internships(id) NULL,
  job_id INTEGER REFERENCES jobs(id) NULL,
  cover_letter TEXT,
  status VARCHAR(50) DEFAULT 'applied', -- applied, shortlisted, rejected, hired
  application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Courses
```sql
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  course_type VARCHAR(50) NOT NULL, -- certification, placement_guarantee
  duration_weeks INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  discount_percentage INTEGER DEFAULT 0,
  rating DECIMAL(2,1),
  learner_count INTEGER DEFAULT 0,
  placement_guarantee BOOLEAN DEFAULT FALSE,
  placement_salary_min INTEGER,
  placement_salary_max INTEGER,
  placement_type VARCHAR(50), -- job, internship
  placement_stipend INTEGER,
  category VARCHAR(100) NOT NULL,
  thumbnail_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Enrollments
```sql
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES student_profiles(id),
  course_id INTEGER REFERENCES courses(id),
  payment_id VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'pending',
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completion_date TIMESTAMP,
  certificate_url VARCHAR(255),
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile
- `POST /api/auth/password/reset` - Request password reset
- `POST /api/auth/password/change` - Change password

### Student Profile
- `GET /api/student/profile` - Get student profile
- `PUT /api/student/profile` - Update student profile
- `POST /api/student/resume` - Upload resume
- `GET /api/student/resume` - Download resume
- `PUT /api/student/preferences` - Update preferences

### Employer Profile
- `GET /api/employer/profile` - Get employer profile
- `PUT /api/employer/profile` - Update employer profile
- `POST /api/employer/logo` - Upload company logo

### Internships
- `GET /api/internships` - List internships with filters
- `GET /api/internships/:id` - Get internship details
- `POST /api/internships` - Create internship (employer only)
- `PUT /api/internships/:id` - Update internship (employer only)
- `DELETE /api/internships/:id` - Delete internship (employer only)
- `POST /api/internships/:id/apply` - Apply to internship
- `GET /api/internships/applications` - Get internship applications

### Jobs
- `GET /api/jobs` - List jobs with filters
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (employer only)
- `PUT /api/jobs/:id` - Update job (employer only)
- `DELETE /api/jobs/:id` - Delete job (employer only)
- `POST /api/jobs/:id/apply` - Apply to job
- `GET /api/jobs/applications` - Get job applications

### Applications
- `GET /api/applications` - Get all applications (student view)
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id` - Update application status (employer only)

### Courses
- `GET /api/courses` - List courses with filters
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/courses/enrolled` - Get enrolled courses
- `GET /api/courses/:id/progress` - Get course progress
- `PUT /api/courses/:id/progress` - Update course progress

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

## Frontend Components

### Common Components
- **Navbar**: Main navigation with dynamic menu based on user type
- **Footer**: Site links, categories, and social media
- **SearchBar**: Global search functionality
- **FilterPanel**: Advanced filtering for listings
- **Pagination**: For listing pages
- **NotificationBell**: Real-time notification indicator
- **UserDropdown**: Profile and settings access
- **Modal**: Reusable modal for various purposes
- **Toast**: Notification system for user feedback

### Student Dashboard Components
- **ProfileCompletion**: Progress indicator for profile completion
- **ResumeBuilder**: Multi-section resume creation tool
- **ApplicationTracker**: Status tracking for applications
- **CourseProgress**: Progress tracking for enrolled courses
- **RecommendationCard**: Personalized recommendations
- **SavedListings**: Bookmarked internships/jobs

### Employer Dashboard Components
- **ListingManager**: Manage internship/job postings
- **ApplicationReview**: Review and manage applications
- **CandidateSearch**: Search for candidates
- **Analytics**: View posting performance

### Course Platform Components
- **CourseCard**: Display course information
- **CourseFilter**: Filter courses by category, duration, etc.
- **EnrollmentFlow**: Step-by-step enrollment process
- **LearningInterface**: Video player, content viewer
- **AssignmentSubmission**: Submit and track assignments
- **CertificateViewer**: View and download certificates

## Page Structure

### Public Pages
- **Home**: Landing page with featured listings and courses
- **Internship Listings**: Browse and filter internships
- **Job Listings**: Browse and filter jobs
- **Course Catalog**: Browse and filter courses
- **About**: Company information
- **Contact**: Contact form and information
- **Terms & Privacy**: Legal pages

### Student Pages
- **Dashboard**: Overview of activities and recommendations
- **Profile**: Manage personal information
- **Resume**: Build and manage resume
- **Applications**: Track application status
- **Saved Items**: View saved listings
- **Enrolled Courses**: Access learning materials
- **Notifications**: View all notifications
- **Settings**: Account preferences

### Employer Pages
- **Dashboard**: Overview of postings and applications
- **Company Profile**: Manage company information
- **Post Internship**: Create and manage internship listings
- **Post Job**: Create and manage job listings
- **Applications**: Review candidate applications
- **Analytics**: View posting performance
- **Settings**: Account preferences

### Admin Pages
- **Dashboard**: Platform overview
- **User Management**: Manage users
- **Content Management**: Manage listings and courses
- **Reports**: View platform analytics
- **Settings**: Platform configuration

## Implementation Recommendations

### Development Approach
1. **Modular Architecture**: Build independent services that communicate via APIs
2. **Mobile-First Design**: Ensure responsive design for all screen sizes
3. **Progressive Enhancement**: Core functionality works without JavaScript
4. **Accessibility**: Follow WCAG guidelines for accessibility
5. **Internationalization**: Support for multiple languages

### Authentication & Security
1. Implement JWT-based authentication with refresh tokens
2. Use OAuth for social login (Google, LinkedIn)
3. Implement role-based access control (RBAC)
4. Use HTTPS for all communications
5. Implement rate limiting to prevent abuse

### Search & Filtering
1. Use Elasticsearch for advanced search capabilities
2. Implement faceted search for filtering
3. Add typeahead suggestions for search queries
4. Support for location-based search
5. Save user search preferences

### Performance Optimization
1. Implement server-side rendering for initial page load
2. Use client-side rendering for subsequent interactions
3. Implement lazy loading for images and components
4. Use CDN for static assets
5. Implement caching strategies for API responses

### Deployment Strategy
1. Use Docker containers for consistent environments
2. Implement CI/CD pipeline for automated testing and deployment
3. Use environment-specific configuration
4. Implement blue-green deployment for zero-downtime updates
5. Set up monitoring and alerting

## Feature Implementation Priority

### Phase 1: Core Platform
1. User authentication and profile management
2. Basic internship and job listings
3. Application submission and tracking
4. Simple course catalog
5. Basic search and filtering

### Phase 2: Enhanced Features
1. Advanced resume builder
2. Sophisticated search and filtering
3. Notification system
4. Course enrollment and payment
5. Employer dashboard

### Phase 3: Advanced Features
1. Learning management system
2. Analytics and reporting
3. Recommendation engine
4. Mobile applications
5. API for third-party integrations

## Testing Strategy

### Unit Testing
- Test individual components and functions
- Use Jest for JavaScript/TypeScript testing
- Aim for >80% code coverage

### Integration Testing
- Test API endpoints and service interactions
- Use Supertest for API testing
- Verify database operations

### End-to-End Testing
- Test complete user flows
- Use Cypress for browser testing
- Test on multiple browsers and devices

### Performance Testing
- Load testing with tools like k6
- Measure and optimize page load times
- Test database query performance

## Maintenance Considerations

### Monitoring
- Implement application performance monitoring
- Set up error tracking and reporting
- Monitor server resources and database performance

### Backup Strategy
- Regular database backups
- Automated backup verification
- Disaster recovery plan

### Scaling Plan
- Horizontal scaling for web servers
- Database read replicas for scaling reads
- Caching layer for frequently accessed data
- CDN for static content delivery

## Conclusion

This technical specification provides a comprehensive blueprint for building an Internshala-like platform. The implementation should focus on creating a scalable, maintainable, and user-friendly system that can grow with increasing user demand. By following the modular architecture approach, the development team can work on different components in parallel and integrate them seamlessly.

The platform should prioritize user experience, particularly for students seeking internships, jobs, and courses, while also providing employers with efficient tools to post opportunities and manage applications. The training platform should be tightly integrated with the main platform to provide a cohesive experience.

Regular feedback loops during development will ensure the platform meets user needs and can adapt to changing requirements.
