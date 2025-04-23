import { Link } from 'wouter';
import { Internship } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateToNow, formatStipend, isDeadlineApproaching } from '@/lib/utils';
import { Bookmark, MapPin, Calendar, DollarSign, Clock, Zap, Briefcase } from 'lucide-react';

interface InternshipCardProps {
  internship: Internship;
  onSave?: (id: number) => void;
}

const InternshipCard = ({ internship, onSave }: InternshipCardProps) => {
  const {
    id,
    title,
    employer,
    location,
    isRemote,
    isPartTime,
    durationMonths,
    stipendAmount,
    stipendCurrency,
    skillsRequired,
    jobOfferPossibility,
    applicationDeadline,
    createdAt
  } = internship;

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
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center">
            <Zap className="h-3 w-3 mr-1" /> Actively Hiring
          </Badge>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="text-sm font-medium text-gray-800 flex items-center">
                <MapPin className="mr-1 h-3 w-3 text-gray-400" /> 
                {isRemote ? 'Work from Home' : location}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Duration</p>
              <p className="text-sm font-medium text-gray-800 flex items-center">
                <Calendar className="mr-1 h-3 w-3 text-gray-400" /> 
                {durationMonths} {durationMonths === 1 ? 'Month' : 'Months'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Stipend</p>
              <p className="text-sm font-medium text-gray-800 flex items-center">
                <DollarSign className="mr-1 h-3 w-3 text-gray-400" /> 
                {formatStipend(stipendAmount, stipendCurrency)}
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
          
          <div className="flex items-center text-xs text-gray-500 mb-4">
            <Clock className="h-3 w-3 mr-1" />
            {formatDateToNow(createdAt)}
            
            {isPartTime && (
              <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
                Part-time
              </Badge>
            )}
            
            {jobOfferPossibility && (
              <Badge className="ml-2 bg-amber-100 text-amber-800 border-amber-200">
                Job Offer
              </Badge>
            )}
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
        <Link href={`/internships/${id}`} className="ml-auto">
          <Button className="bg-primary-600 hover:bg-primary-700 text-white">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default InternshipCard;
