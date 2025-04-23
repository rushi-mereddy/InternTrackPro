import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useLocation } from 'wouter';
import { Loader2, Calendar, Award, Bookmark, ArrowLeft, DollarSign, Users, Star, CheckCircle, BookOpen, GraduationCap, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatRating, formatLearnerCount, calculateDiscountPrice, formatCourseDuration, formatSalary } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Fetch course details
  const { data: course, isLoading, error } = useQuery({
    queryKey: [`/api/courses/${id}`],
    enabled: !!id,
  });

  // Fetch user enrollments if logged in
  const { data: enrollments = [] } = useQuery({
    queryKey: ['/api/enrollments'],
    enabled: !!user,
  });

  // Check if user is already enrolled
  const isEnrolled = enrollments.some((enrollment: any) => enrollment.courseId === parseInt(id));

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setIsEnrolling(true);
      await apiRequest('POST', '/api/enrollments', { 
        courseId: parseInt(id),
        paymentStatus: 'completed' // Simplified for demo
      });

      toast({
        title: "Enrollment successful",
        description: "You have successfully enrolled in this course.",
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Enrollment failed",
        description: error instanceof Error ? error.message : "Failed to enroll in this course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 p-4 rounded-md">
          <h2 className="text-lg font-medium text-red-800">Course not found</h2>
          <p className="mt-2 text-red-700">
            We couldn't find the course you're looking for. It may have been removed or doesn't exist.
          </p>
          <Link href="/courses">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const {
    title,
    description,
    courseType,
    durationWeeks,
    price,
    discountPercentage,
    rating,
    learnerCount,
    placementGuarantee,
    placementSalaryMin,
    placementSalaryMax,
    placementType,
    placementStipend,
    category,
    thumbnail,
  } = course;

  // Calculate discounted price
  const finalPrice = discountPercentage > 0 
    ? calculateDiscountPrice(price, discountPercentage) 
    : price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/courses">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to courses
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - 2/3 width */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-6">
            {/* Header */}
            <div className="relative">
              <img 
                src={thumbnail || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"} 
                alt={title}
                className="w-full h-64 object-cover"
              />
              {discountPercentage > 0 && (
                <div className="absolute top-4 right-4 bg-accent-500 text-white text-sm font-bold px-3 py-1 rounded">
                  {discountPercentage}% OFF
                </div>
              )}
              {placementGuarantee && (
                <div className="absolute top-4 left-4 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded">
                  Placement Guaranteed
                </div>
              )}
            </div>
            
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  <div className="flex items-center mt-2 flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-primary-100 text-primary-800 hover:bg-primary-200">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatCourseDuration(durationWeeks)}
                    </Badge>
                    
                    {rating && (
                      <div className="flex items-center text-sm">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="font-medium text-gray-700">{formatRating(rating)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-600">{formatLearnerCount(learnerCount)}</span>
                    </div>
                    
                    <Badge variant="secondary" className="capitalize">
                      {category.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">About this course</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{description}</p>
              </div>
              
              <div className="mt-8">
                <h3 className="text-md font-medium text-gray-900 mb-3">What you'll learn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">
                        {index === 0 ? 'Practical, hands-on learning experience' :
                         index === 1 ? 'Industry-relevant curriculum' :
                         index === 2 ? 'Projects for your portfolio' :
                         index === 3 ? 'Personalized feedback on your work' :
                         index === 4 ? 'Certificate upon completion' :
                         'Job-ready skills to boost your career'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Course features */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-4 flex items-center">
                    <BookOpen className="h-8 w-8 text-primary-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">Self-paced learning</h4>
                      <p className="text-sm text-gray-600">Learn at your own schedule</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center">
                    <Award className="h-8 w-8 text-primary-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">Certificate</h4>
                      <p className="text-sm text-gray-600">Earn upon completion</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center">
                    <GraduationCap className="h-8 w-8 text-primary-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">24/7 Support</h4>
                      <p className="text-sm text-gray-600">Get help when you need it</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Placement details for placement guarantee courses */}
              {placementGuarantee && (
                <div className="mt-8 p-6 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 text-green-500 mr-2" />
                    Placement Guarantee Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Placement Type</p>
                      <p className="text-sm text-gray-600 capitalize">{placementType}</p>
                    </div>
                    {placementType === 'job' && placementSalaryMin && placementSalaryMax && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Expected Salary</p>
                        <p className="text-sm text-gray-600">
                          {formatSalary(placementSalaryMin, placementSalaryMax)}
                        </p>
                      </div>
                    )}
                    {placementType === 'internship' && placementStipend && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Internship Stipend</p>
                        <p className="text-sm text-gray-600">
                          ₹{placementStipend.toLocaleString()} total
                        </p>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-green-700">
                        {placementType === 'job' 
                          ? '100% Job guarantee or full refund of course fee' 
                          : '100% Internship placement guarantee or full refund of course fee'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 sticky top-24">
            <div className="p-6">
              <div className="mb-6">
                {discountPercentage > 0 ? (
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-gray-900">₹{finalPrice.toLocaleString()}</span>
                    <span className="ml-2 text-lg text-gray-500 line-through">₹{price.toLocaleString()}</span>
                    <Badge className="ml-2 bg-accent-500 text-white border-0">
                      {discountPercentage}% OFF
                    </Badge>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">₹{price.toLocaleString()}</span>
                )}
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">30-day money-back guarantee</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">Access on mobile and desktop</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">Certificate of completion</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {isEnrolled ? (
                  <Button variant="secondary" disabled className="w-full">
                    Already Enrolled
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-primary-600 hover:bg-primary-700"
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                  >
                    {isEnrolling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Enroll Now'
                    )}
                  </Button>
                )}
                
                <Button variant="outline" className="w-full">
                  <Bookmark className="h-4 w-4 mr-2" /> Save
                </Button>
              </div>
              
              {!user && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                  <p>Please <Link href="/login" className="text-primary-600 font-medium">log in</Link> or <Link href="/register" className="text-primary-600 font-medium">register</Link> to enroll in this course.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
