import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface TrendingCardProps {
  title: string;
  description: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  path: string;
  badge?: string;
}

const TrendingCard = ({
  title,
  description,
  icon,
  iconBgColor,
  iconColor,
  path,
  badge
}: TrendingCardProps) => {
  return (
    <Card className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow h-full">
      <CardContent className="p-0">
        <div className={`${iconBgColor} p-4 flex items-center`}>
          <i className={`fas ${icon} ${iconColor} text-xl mr-3`}></i>
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          
          {badge && (
            <div className="flex items-center mb-3">
              <Badge variant="outline" className="bg-accent-500 text-white border-0">
                {badge}
              </Badge>
            </div>
          )}
          
          <Link href={path} className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
            {title.includes('Placement') ? 'Explore courses' : 
              title.includes('Certification') ? 'View courses' : 'Find opportunities'}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingCard;
