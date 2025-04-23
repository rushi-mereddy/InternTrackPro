import { Link } from 'wouter';
import { Course } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCourseDuration, formatRating, formatSalary } from '@/lib/utils';
import { CheckCircle, DollarSign, Briefcase } from 'lucide-react';

interface PlacementCourseCardProps {
  course: Course;
}

const PlacementCourseCard = ({ course }: PlacementCourseCardProps) => {
  const {
    id,
    title,
    durationWeeks,
    rating,
    placementGuarantee,
    placementSalaryMin,
    placementSalaryMax,
    placementType,
    placementStipend,
    thumbnail
  } = course;

  return (
    <Card className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow flex">
      <div className="w-1/3 relative">
        <img 
          src={thumbnail || 'https://via.placeholder.com/400x200?text=Course+Image'} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-2/3 p-4">
        <div className="flex flex-col h-full">
          <div>
            <div className="flex items-center mb-2">
              <h3 className="font-medium text-gray-900">{title}</h3>
              <Badge variant="secondary" className="ml-2 bg-primary-100 text-primary-800 hover:bg-primary-200">
                {formatCourseDuration(durationWeeks)}
              </Badge>
            </div>
            
            {rating && (
              <div className="flex items-center mb-4">
                <div className="flex items-center text-amber-500">
                  <i className="fas fa-star text-xs"></i>
                  <i className="fas fa-star text-xs"></i>
                  <i className="fas fa-star text-xs"></i>
                  <i className="fas fa-star text-xs"></i>
                  <i className="fas fa-star-half-alt text-xs"></i>
                </div>
                <span className="ml-1 text-xs font-medium text-gray-600">{formatRating(rating)}</span>
              </div>
            )}
            
            <div className="space-y-2 mb-4">
              {placementGuarantee && (
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-secondary-500 mr-2" />
                  <span className="text-gray-700">
                    {placementType === 'job' ? 'Guaranteed job offer' : 'Internship placement'}
                  </span>
                </div>
              )}
              
              {(placementSalaryMin || placementSalaryMax) && (
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 text-secondary-500 mr-2" />
                  <span className="text-gray-700">
                    {formatSalary(placementSalaryMin, placementSalaryMax)} salary
                  </span>
                </div>
              )}
              
              {placementStipend && placementType === 'internship' && (
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 text-secondary-500 mr-2" />
                  <span className="text-gray-700">
                    ₹{placementStipend.toLocaleString()} total stipend
                  </span>
                </div>
              )}
              
              <div className="flex items-center text-sm">
                <Briefcase className="h-4 w-4 text-secondary-500 mr-2" />
                <span className="text-gray-700">
                  {Math.floor(Math.random() * 100)}K+ opportunities
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-auto">
            <Link href={`/courses/${id}`}>
              <Button 
                className="w-full bg-primary-600 hover:bg-primary-700 text-white"
              >
                View Program
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PlacementCourseCard;
