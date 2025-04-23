import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TrendingCard from '@/components/ui/TrendingCard';
import InternshipCard from '@/components/ui/InternshipCard';
import JobCard from '@/components/ui/JobCard';
import CourseCard from '@/components/ui/CourseCard';
import PlacementCourseCard from '@/components/ui/PlacementCourseCard';
import { TRENDING_ITEMS, PLATFORM_STATS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const Home = () => {
  const [savedInternships, setSavedInternships] = useState<number[]>([]);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

  // Fetch internships
  const { data: internships = [] } = useQuery({
    queryKey: ['/api/internships'],
  });

  // Fetch jobs
  const { data: jobs = [] } = useQuery({
    queryKey: ['/api/jobs'],
  });

  // Fetch courses
  const { data: allCourses = [] } = useQuery({
    queryKey: ['/api/courses'],
  });

  // Filter courses by type
  const certificationCourses = allCourses.filter((course: any) => course.courseType === 'certification');
  const placementCourses = allCourses.filter((course: any) => course.courseType === 'placement_guarantee');

  const handleSaveInternship = (id: number) => {
    setSavedInternships(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSaveJob = (id: number) => {
    setSavedJobs(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Kickstart your</span>
                <span className="block text-primary-600">career journey</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg md:mt-5 md:text-xl">
                Find internships, jobs, and skill-building courses that align with your career goals. Connect with top companies and start building your professional future today.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0 space-y-3">
                <Link href="/internships">
                  <Button className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                    Browse Internships
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button variant="outline" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200">
                    Explore Courses
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <img 
                className="h-auto w-full max-w-md rounded-lg shadow-lg" 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80" 
                alt="Students collaborating" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {PLATFORM_STATS.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <p className="text-3xl font-bold text-white">{stat.number}</p>
                <p className="mt-2 text-sm font-medium text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Trending on InternHub</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRENDING_ITEMS.map((item, index) => (
              <TrendingCard
                key={index}
                title={item.title}
                description={item.description}
                icon={item.icon}
                iconBgColor={item.iconBgColor}
                iconColor={item.iconColor}
                path={item.path}
                badge={item.badge}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Internships Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Internships</h2>
            <Link href="/internships" className="text-primary-600 hover:text-primary-700 font-medium text-sm">View all internships</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.slice(0, 3).map((internship: any) => (
              <InternshipCard 
                key={internship.id} 
                internship={internship} 
                onSave={handleSaveInternship}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Latest Jobs Section */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Latest Jobs</h2>
            <Link href="/jobs" className="text-primary-600 hover:text-primary-700 font-medium text-sm">View all jobs</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.slice(0, 3).map((job: any) => (
              <JobCard 
                key={job.id} 
                job={job} 
                onSave={handleSaveJob}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Certification Courses Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Certification Courses</h2>
              <p className="text-gray-500 mt-1">Fastest way to build your CV</p>
            </div>
            <Link href="/courses?type=certification" className="text-primary-600 hover:text-primary-700 font-medium text-sm">View all courses</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certificationCourses.slice(0, 4).map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Placement Guarantee Section */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Placement Guarantee Courses</h2>
            <p className="text-gray-500 mt-2">Guaranteed way to start your career</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {placementCourses.slice(0, 2).map((course: any) => (
              <PlacementCourseCard key={course.id} course={course} />
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/courses?type=placement_guarantee">
              <Button className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                View All Placement Programs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Ready to start your career journey?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-primary-100">
                Register now to access thousands of internships, jobs, and courses. Create your profile, build your resume, and start applying today!
              </p>
              <div className="mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Link href="/register">
                  <Button variant="secondary" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50">
                    Sign up as a Student
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="inline-flex items-center justify-center px-5 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-primary-500">
                    Sign up as an Employer
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="px-6 py-8 sm:p-10">
                  <h3 className="text-lg font-medium text-gray-900">Join 1.5M+ students & 2000+ companies</h3>
                  <div className="mt-6 flex items-start">
                    <div className="flex-shrink-0">
                      <i className="fas fa-user-graduate text-primary-600 text-xl"></i>
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-medium text-gray-900">For Students</p>
                      <p className="mt-1 text-sm text-gray-500">Find internships, jobs & courses that match your interests & goals.</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-start">
                    <div className="flex-shrink-0">
                      <i className="fas fa-building text-primary-600 text-xl"></i>
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-medium text-gray-900">For Employers</p>
                      <p className="mt-1 text-sm text-gray-500">Hire quality candidates for internships & jobs across India.</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-start">
                    <div className="flex-shrink-0">
                      <i className="fas fa-laptop-code text-primary-600 text-xl"></i>
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-medium text-gray-900">For Learners</p>
                      <p className="mt-1 text-sm text-gray-500">Upgrade your skills with industry-relevant courses & guarantee your placement.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
