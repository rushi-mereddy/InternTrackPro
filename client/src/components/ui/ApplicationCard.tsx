import { Application } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateToNow, getStatusColor } from '@/lib/utils';
import { Briefcase, Calendar, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';

interface ApplicationCardProps {
  application: Application;
}

const ApplicationCard = ({ application }: ApplicationCardProps) => {
  const {
    id,
    listing,
    listingType,
    employer,
    status,
    applicationDate
  } = application;

  if (!listing || !employer) {
    return null;
  }

  const statusColors = getStatusColor(status);

  return (
    <Card className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className="mr-3 flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
            {employer.companyLogo ? (
              <img src={employer.companyLogo} alt={employer.companyName} className="h-6 w-6" />
            ) : (
              <Briefcase className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">{listing.title}</h4>
              <Badge className={`${statusColors.bg} ${statusColors.text} capitalize`}>
                {status}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              {employer.companyName} • {listingType === 'internship' ? 'Internship' : 'Job'}
            </p>
            
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Applied: {formatDateToNow(applicationDate)}</span>
            </div>
            
            {status === 'shortlisted' && (
              <div className="mt-3 p-2 bg-amber-50 text-amber-800 text-xs rounded">
                <p className="font-medium">You've been shortlisted!</p>
                <p>The employer will contact you soon for the next steps.</p>
              </div>
            )}
            
            {status === 'interview' && (
              <div className="mt-3 p-2 bg-green-50 text-green-800 text-xs rounded">
                <p className="font-medium">Interview scheduled!</p>
                <p>Check your email for interview details.</p>
              </div>
            )}
            
            {status === 'rejected' && (
              <div className="mt-3 p-2 bg-red-50 text-red-800 text-xs rounded">
                <p className="font-medium">Application not selected</p>
                <p>Don't worry, keep applying to find the right opportunity.</p>
              </div>
            )}
            
            <div className="mt-3 flex justify-end space-x-2">
              <Link 
                href={listingType === 'internship' ? `/internships/${listing.id}` : `/jobs/${listing.id}`}
              >
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                >
                  <ExternalLink className="h-3 w-3 mr-1" /> View {listingType}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationCard;
