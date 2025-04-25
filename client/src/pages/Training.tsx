import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Play, 
  Clock, 
  CheckCircle, 
  Search, 
  Filter,
  GraduationCap,
  Code,
  Briefcase,
  Users
} from 'lucide-react';

interface TrainingResource {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'video' | 'article' | 'workshop';
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  progress?: number;
  completed?: boolean;
  category: string;
  thumbnail?: string;
}

const Training = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Categories', icon: Filter },
    { id: 'technical', name: 'Technical Skills', icon: Code },
    { id: 'soft', name: 'Soft Skills', icon: Users },
    { id: 'career', name: 'Career Development', icon: Briefcase },
    { id: 'certification', name: 'Certifications', icon: GraduationCap },
  ];

  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
  ];

  const [resources] = useState<TrainingResource[]>([
    {
      id: '1',
      title: 'Introduction to Web Development',
      description: 'Learn the fundamentals of HTML, CSS, and JavaScript',
      type: 'course',
      duration: '8 hours',
      level: 'beginner',
      progress: 75,
      category: 'technical',
      thumbnail: '/images/web-dev.jpg'
    },
    {
      id: '2',
      title: 'Interview Preparation Workshop',
      description: 'Master the art of technical interviews and problem-solving',
      type: 'workshop',
      duration: '4 hours',
      level: 'intermediate',
      progress: 100,
      completed: true,
      category: 'career'
    },
    {
      id: '3',
      title: 'Advanced React Patterns',
      description: 'Deep dive into React patterns and best practices',
      type: 'video',
      duration: '2 hours',
      level: 'advanced',
      category: 'technical'
    },
    {
      id: '4',
      title: 'Communication Skills for Developers',
      description: 'Improve your communication and collaboration skills',
      type: 'course',
      duration: '6 hours',
      level: 'beginner',
      progress: 30,
      category: 'soft'
    }
  ]);

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || resource.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getResourceIcon = (type: TrainingResource['type']) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-5 w-5" />;
      case 'video':
        return <Play className="h-5 w-5" />;
      case 'article':
        return <BookOpen className="h-5 w-5" />;
      case 'workshop':
        return <Users className="h-5 w-5" />;
    }
  };

  const getLevelBadge = (level: TrainingResource['level']) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={colors[level]}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar className="w-64 h-screen sticky top-0 hidden md:block" />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Training Resources</h1>
            <p className="text-gray-500">Enhance your skills with our curated learning materials</p>
          </div>

          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search resources..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                {levels.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="overflow-hidden">
                {resource.thumbnail && (
                  <div className="h-48 bg-gray-200">
                    <img
                      src={resource.thumbnail}
                      alt={resource.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    {getResourceIcon(resource.type)}
                  </div>
                  {getLevelBadge(resource.level)}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">{resource.description}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Clock className="h-4 w-4 mr-2" />
                    {resource.duration}
                  </div>
                  {resource.progress !== undefined && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{resource.progress}%</span>
                      </div>
                      <Progress value={resource.progress} />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    {resource.completed ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      'Start Learning'
                    )}
                  </Button>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Training; 