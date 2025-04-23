import { Link } from 'wouter';
import { Job } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateToNow, formatSalary, isDeadlineApproaching } from '@/lib/utils';
import { Bookmark, MapPin, Briefcase, DollarSign, Clock, Zap, GraduationCap, Home } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onSave?: (id: number) => void;
}

const JobCard = ({ job, onSave }: JobCardProps) => {
  const {
    id,
    title,
    employer,
    location,
    isRemote,
    salaryMin,
    salaryMax,
    salaryCurrency,
    experienceRequiredYears,
    isFresherJob,
    skillsRequired,
    applicationDeadline,
    createdAt
  } = job;

  return (
    <Card className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-4 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center">
            <div className="mr-3 flex-shrink-0 h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center">
              {employer?.companyLogo ? (
                <img src={employer.companyLogo} alt={employer.companyName} className="h-8 w-8" />
              ) : (
                <Briefcase className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{employer?.companyName}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center">
              <Zap className="h-3 w-3 mr-1" /> Actively Hiring
            </Badge>
            {isFresherJob && (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center">
                <GraduationCap className="h-3 w-3 mr-1" /> Fresher Job
              </Badge>
            )}
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="text-sm font-medium text-gray-800 flex items-center">
                {isRemote ? (
                  <>
                    <Home className="mr-1 h-3 w-3 text-gray-400" /> 
                    Work from Home
                  </>
                ) : (
                  <>
                    <MapPin className="mr-1 h-3 w-3 text-gray-400" /> 
                    {location}
                  </>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Experience</p>
              <p className="text-sm font-medium text-gray-800 flex items-center">
                <Briefcase className="mr-1 h-3 w-3 text-gray-400" /> 
                {isFresherJob 
                  ? 'Fresher'
                  : experienceRequiredYears === 0 
                    ? 'No experience required' 
                    : `${experienceRequiredYears} Years`
                }
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Salary</p>
              <p className="text-sm font-medium text-gray-800 flex items-center">
                <DollarSign className="mr-1 h-3 w-3 text-gray-400" /> 
                {formatSalary(salaryMin, salaryMax, salaryCurrency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Apply By</p>
              <p className={`text-sm font-medium flex items-center ${
                isDeadlineApproaching(applicationDeadline) ? 'text-red-600' : 'text-gray-800'
              }`}>
                <Clock className="mr-1 h-3 w-3 text-gray-400" /> 
                {applicationDeadline ? formatDateToNow(applicationDeadline) : 'Not specified'}
              </p>
            </div>
          </div>
          
          {skillsRequired && skillsRequired.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {skillsRequired.slice(0, 4).map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                  {skill}
                </Badge>
              ))}
              {skillsRequired.length > 4 && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                  +{skillsRequired.length - 4} more
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <Clock className="h-3 w-3 mr-1" />
            {formatDateToNow(createdAt)}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        {onSave && (
          <Button 
            variant="ghost"
            className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
            onClick={() => onSave(id)}
          >
            <Bookmark className="h-4 w-4 mr-1" /> Save
          </Button>
        )}
        <Link href={`/jobs/${id}`} className="ml-auto">
          <Button className="bg-primary-600 hover:bg-primary-700 text-white">
            Apply Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default JobCard;
