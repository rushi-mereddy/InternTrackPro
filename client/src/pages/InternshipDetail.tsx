import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useLocation } from 'wouter';
import { Loader2, MapPin, Calendar, DollarSign, Clock, Briefcase, CheckCircle, Award, Bookmark, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, formatStipend, isDeadlineApproaching } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const InternshipDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isApplying, setIsApplying] = useState(false);

  // Fetch internship details
  const { data: internship, isLoading, error } = useQuery({
    queryKey: [`/api/internships/${id}`],
    enabled: !!id,
  });

  // Fetch related courses
  const { data: courses = [] } = useQuery({
    queryKey: ['/api/courses'],
  });
  
  // Filter related courses based on internship skills
  const relatedCourses = courses
    .filter((course: any) => {
      if (!internship?.skillsRequired?.length) return false;
      const courseTitle = course.title.toLowerCase();
      return internship.skillsRequired.some((skill: string) => 
        courseTitle.includes(skill.toLowerCase())
      );
    })
    .slice(0, 2);

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setIsApplying(true);
      await apiRequest('POST', '/api/applications', { 
        internshipId: parseInt(id)
      });

      toast({
        title: "Application submitted",
        description: "Your application has been successfully submitted.",
      });

      navigate('/applications');
    } catch (error) {
      toast({
        title: "Application failed",
        description: error instanceof Error ? error.message : "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 p-4 rounded-md">
          <h2 className="text-lg font-medium text-red-800">Internship not found</h2>
          <p className="mt-2 text-red-700">
            We couldn't find the internship you're looking for. It may have been removed or doesn't exist.
          </p>
          <Link href="/internships">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to internships
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const {
    title,
    employer,
    description,
    location,
    isRemote,
    isPartTime,
    stipendAmount,
    stipendCurrency,
    durationMonths,
    startDate,
    applicationDeadline,
    skillsRequired = [],
    responsibilities = [],
    perks = [],
    jobOfferPossibility,
  } = internship;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/internships">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to internships
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - 2/3 width */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-6">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  <div className="flex items-center mt-2">
                    <div className="mr-3 flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                      {employer?.companyLogo ? (
                        <img src={employer.companyLogo} alt={employer.companyName} className="h-6 w-6" />
                      ) : (
                        <Briefcase className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">{employer?.companyName}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isRemote && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Work from Home
                    </Badge>
                  )}
                  {isPartTime && (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                      Part-time
                    </Badge>
                  )}
                  {jobOfferPossibility && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800">
                      Job Offer Possibility
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Key Details */}
            <div className="p-6 bg-gray-50 grid grid-cols-2 sm:grid-cols-4 gap-6 border-b border-gray-100">
              <div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                  <p className="text-sm font-medium text-gray-900">Location</p>
                </div>
                <p className="mt-1 text-sm text-gray-600 ml-7">
                  {isRemote ? 'Work from Home' : location || 'Not specified'}
                </p>
              </div>
              <div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <p className="text-sm font-medium text-gray-900">Start Date</p>
                </div>
                <p className="mt-1 text-sm text-gray-600 ml-7">
                  {startDate ? formatDate(startDate) : 'Immediate'}
                </p>
              </div>
              <div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                  <p className="text-sm font-medium text-gray-900">Stipend</p>
                </div>
                <p className="mt-1 text-sm text-gray-600 ml-7">
                  {formatStipend(stipendAmount, stipendCurrency)}
                </p>
              </div>
              <div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-2" />
                  <p className="text-sm font-medium text-gray-900">Apply By</p>
                </div>
                <p className={`mt-1 text-sm ml-7 ${isDeadlineApproaching(applicationDeadline) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                  {applicationDeadline ? formatDate(applicationDeadline) : 'Not specified'}
                </p>
              </div>
            </div>
            
            {/* Description */}
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">About the internship</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700">{description}</p>
              </div>
              
              {responsibilities.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Key Responsibilities</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {responsibilities.map((item: string, index: number) => (
                      <li key={index} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {skillsRequired.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {skillsRequired.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-800">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {perks.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Perks</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {perks.map((perk: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-primary-600 mr-2" />
                        <span className="text-gray-700">{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Courses */}
          {relatedCourses.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recommended Courses</h2>
              <p className="text-gray-600 mb-4">
                Improve your chances of selection by developing these skills
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedCourses.map((course: any) => (
                  <Card key={course.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-center p-4 border-b border-gray-100">
                        <Award className="h-5 w-5 text-primary-600 mr-3" />
                        <h3 className="font-medium text-gray-900">{course.title}</h3>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-600 mb-3">
                          {course.description.length > 100 
                            ? `${course.description.substring(0, 100)}...` 
                            : course.description}
                        </p>
                        <Link href={`/courses/${course.id}`}>
                          <Button variant="outline" className="w-full">
                            View Course
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 sticky top-24">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Application Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">{title}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">{isRemote ? 'Work from Home' : location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">{durationMonths} {durationMonths === 1 ? 'Month' : 'Months'}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">{formatStipend(stipendAmount, stipendCurrency)}</span>
                </div>
                {applicationDeadline && (
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-3" />
                    <span className={isDeadlineApproaching(applicationDeadline) ? 'text-red-600 font-medium' : 'text-gray-700'}>
                      Apply by {formatDate(applicationDeadline)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Button 
                  className="w-full bg-primary-600 hover:bg-primary-700"
                  onClick={handleApply}
                  disabled={isApplying}
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    'Apply Now'
                  )}
                </Button>
                <Button variant="outline" className="w-full">
                  <Bookmark className="h-4 w-4 mr-2" /> Save
                </Button>
              </div>
              
              {!user && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                  <p>Please <Link href="/login" className="text-primary-600 font-medium">log in</Link> or <Link href="/register" className="text-primary-600 font-medium">register</Link> to apply for this internship.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipDetail;
