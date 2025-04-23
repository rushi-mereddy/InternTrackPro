import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Sidebar from '@/components/layout/Sidebar';
import ProfileProgress from '@/components/ui/ProfileProgress';
import InternshipCard from '@/components/ui/InternshipCard';
import JobCard from '@/components/ui/JobCard';
import ApplicationCard from '@/components/ui/ApplicationCard';
import TrendingCard from '@/components/ui/TrendingCard';
import { TRENDING_ITEMS } from '@/lib/constants';
import { calculateProfileCompletion } from '@/lib/utils';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Fetch user profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['/api/profile'],
  });

  // Fetch recent applications
  const { data: applications = [] } = useQuery({
    queryKey: ['/api/applications'],
  });

  // Fetch recommended internships/jobs based on user preferences
  const { data: internships = [] } = useQuery({
    queryKey: ['/api/internships'],
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['/api/jobs'],
  });

  // Get enrolled courses
  const { data: enrollments = [] } = useQuery({
    queryKey: ['/api/enrollments'],
  });

  // Extract profile data
  const profile = profileData?.profile;
  const skills = profileData?.skills || [];
  const experiences = profileData?.experiences || [];
  const educations = profileData?.educations || [];

  // Get recent applications (limited to 3)
  const recentApplications = applications.slice(0, 3);

  // Get recommended internships/jobs based on user interests (mocked for demo)
  const recommendedInternships = internships.slice(0, 2);
  const recommendedJobs = jobs.slice(0, 2);

  // Calculate profile completion percentage
  const profileCompletionPercentage = profileData 
    ? calculateProfileCompletion(user, profile, educations, experiences, skills)
    : 0;

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar className="w-64 h-screen sticky top-0 hidden md:block" />
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Hi {user.firstName}, welcome back!</h1>
            <p className="text-gray-500">Let's continue your career journey</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Profile Completion */}
              <ProfileProgress 
                user={user}
                profile={profile}
                skills={skills}
                educations={educations}
                experiences={experiences}
              />
              
              {/* Application Stats */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-gray-900">Application Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">Total Applications</p>
                      <p className="text-xl font-bold text-gray-900">{applications.length}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">Shortlisted</p>
                      <p className="text-xl font-bold text-gray-900">
                        {applications.filter((app: any) => app.status === 'shortlisted').length}
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">Interviews</p>
                      <p className="text-xl font-bold text-gray-900">
                        {applications.filter((app: any) => app.status === 'interview').length}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">Active</p>
                      <p className="text-xl font-bold text-gray-900">
                        {applications.filter((app: any) => 
                          ['applied', 'shortlisted', 'interview'].includes(app.status)
                        ).length}
                      </p>
                    </div>
                  </div>
                  
                  <Link href="/applications">
                    <Button variant="ghost" className="w-full mt-4 text-primary-600 hover:text-primary-700">
                      View all applications <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              
              {/* Trending on InternHub */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-gray-900">Trending on InternHub</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {TRENDING_ITEMS.map((item, index) => (
                    <Link key={index} href={item.path}>
                      <div className="flex items-start p-3 rounded-md hover:bg-gray-50 transition-colors">
                        <div className={`${item.iconBgColor} p-2 rounded-md mr-3`}>
                          <i className={`fas ${item.icon} ${item.iconColor} text-sm`}></i>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column (2 cols wide) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Applications */}
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-medium text-gray-900">Recent Applications</CardTitle>
                  <Link href="/applications">
                    <Button variant="link" className="text-sm text-primary-600 p-0 h-auto">View all</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {recentApplications.length > 0 ? (
                    <div className="space-y-4">
                      {recentApplications.map((application: any) => (
                        <ApplicationCard key={application.id} application={application} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-md">
                      <h3 className="text-gray-500 font-medium">No applications yet</h3>
                      <p className="text-gray-400 text-sm">Start applying to internships and jobs</p>
                      <div className="mt-4 flex justify-center gap-2">
                        <Link href="/internships">
                          <Button variant="outline" size="sm">Browse Internships</Button>
                        </Link>
                        <Link href="/jobs">
                          <Button variant="outline" size="sm">Browse Jobs</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Recommended for you */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-gray-900">Recommended for you</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Internships */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium text-gray-700">Internships</h3>
                      <Link href="/internships">
                        <Button variant="link" className="text-xs text-primary-600 p-0 h-auto">View all</Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendedInternships.map((internship: any) => (
                        <InternshipCard key={internship.id} internship={internship} />
                      ))}
                    </div>
                  </div>
                  
                  {/* Jobs */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium text-gray-700">Jobs</h3>
                      <Link href="/jobs">
                        <Button variant="link" className="text-xs text-primary-600 p-0 h-auto">View all</Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendedJobs.map((job: any) => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Enrolled Courses */}
              {enrollments.length > 0 && (
                <Card>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-medium text-gray-900">Your Courses</CardTitle>
                    <Link href="/courses">
                      <Button variant="link" className="text-sm text-primary-600 p-0 h-auto">Explore more</Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {enrollments.map((enrollment: any) => (
                        <div key={enrollment.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{enrollment.course?.title}</h4>
                              <p className="text-sm text-gray-500">
                                {formatCourseDuration(enrollment.course?.durationWeeks || 0)}
                                {enrollment.course?.courseType === 'placement_guarantee' && 
                                  ' • Placement Guaranteed'}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-medium text-gray-700">
                                {enrollment.progressPercentage}% complete
                              </span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <Progress value={enrollment.progressPercentage} className="h-2" />
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Link href={`/courses/${enrollment.course?.id}`}>
                              <Button variant="outline" size="sm">Continue Learning</Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
