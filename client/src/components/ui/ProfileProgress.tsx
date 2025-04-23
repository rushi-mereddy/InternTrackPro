import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle } from 'lucide-react';
import { User, StudentProfile } from '@/lib/types';
import { Link } from 'wouter';
import { calculateProfileCompletion } from '@/lib/utils';

interface ProfileProgressProps {
  user: User;
  profile?: StudentProfile;
  skills?: any[];
  educations?: any[];
  experiences?: any[];
}

const ProfileProgress = ({
  user,
  profile,
  skills = [],
  educations = [],
  experiences = []
}: ProfileProgressProps) => {
  const progressPercentage = calculateProfileCompletion(
    user,
    profile,
    educations,
    experiences,
    skills
  );

  const progressItems = [
    {
      name: 'Personal details',
      complete: !!(user?.firstName && user?.lastName && user?.email),
      path: '/profile'
    },
    {
      name: 'Education details',
      complete: educations.length > 0,
      path: '/profile'
    },
    {
      name: 'Add work experience',
      complete: experiences.length > 0,
      path: '/profile'
    },
    {
      name: 'Add skills',
      complete: skills.length > 0,
      path: '/profile'
    },
  ];

  return (
    <Card className="bg-white rounded-lg shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-gray-900">Complete your profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-primary-600 h-2 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mb-4 font-medium">
          {progressPercentage}% completed
        </div>

        <div className="space-y-3">
          {progressItems.map((item, index) => (
            <div key={index} className="flex items-center">
              <div 
                className={`h-5 w-5 rounded-full ${
                  item.complete 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                } flex items-center justify-center mr-3`}
              >
                {item.complete ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
              </div>
              <p className="text-sm text-gray-600">{item.name}</p>
            </div>
          ))}
        </div>
        <Link href="/profile" className="mt-4 inline-block text-primary-600 hover:text-primary-700 text-sm font-medium">
          Complete your resume →
        </Link>
      </CardContent>
    </Card>
  );
};

export default ProfileProgress;
