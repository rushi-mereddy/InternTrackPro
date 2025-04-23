import { Link } from 'wouter';
import { Course } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRating, formatLearnerCount, calculateDiscountPrice } from '@/lib/utils';
import { Clock, Star, Users } from 'lucide-react';

interface CourseCardProps {
  course: Course;
}

const CourseCard = ({ course }: CourseCardProps) => {
  const {
    id,
    title,
    durationWeeks,
    rating,
    learnerCount,
    price,
    discountPercentage,
    thumbnail
  } = course;

  return (
    <Card className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="relative">
        <img 
          src={thumbnail || 'https://via.placeholder.com/400x200?text=Course+Image'} 
          alt={title}
          className="w-full h-40 object-cover"
        />
        {discountPercentage > 0 && (
          <div className="absolute top-2 right-2 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded">
            {discountPercentage}% OFF
          </div>
        )}
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="flex items-center mb-2">
          <Badge variant="secondary" className="bg-primary-100 text-primary-800 hover:bg-primary-200">
            <Clock className="h-3 w-3 mr-1" />
            {durationWeeks} weeks
          </Badge>
          
          {rating && (
            <div className="ml-2 flex items-center">
              <Star className="h-3 w-3 text-yellow-400" />
              <span className="ml-1 text-xs font-medium text-gray-600">{formatRating(rating)}</span>
            </div>
          )}
          
          <div className="ml-2 text-xs text-gray-500 flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {formatLearnerCount(learnerCount)}
          </div>
        </div>
        
        <h3 className="font-medium text-gray-900 mb-2">{title}</h3>
        
        <div className="mt-auto flex justify-between items-center">
          <div>
            {discountPercentage > 0 ? (
              <>
                <p className="text-xs text-gray-500 line-through">₹{price.toLocaleString()}</p>
                <p className="text-sm font-medium text-gray-900">
                  ₹{calculateDiscountPrice(price, discountPercentage).toLocaleString()}
                </p>
              </>
            ) : (
              <p className="text-sm font-medium text-gray-900">₹{price.toLocaleString()}</p>
            )}
          </div>
          
          <Link href={`/courses/${id}`}>
            <Button 
              variant="outline" 
              className="border-primary-600 text-primary-600 hover:bg-primary-50"
            >
              Know More
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
