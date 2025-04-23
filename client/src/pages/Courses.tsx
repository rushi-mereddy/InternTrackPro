import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import FilterPanel from '@/components/ui/FilterPanel';
import CourseCard from '@/components/ui/CourseCard';
import PlacementCourseCard from '@/components/ui/PlacementCourseCard';
import { Button } from '@/components/ui/button';
import { CourseFilters } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const Courses = () => {
  const [, params] = useLocation();
  const searchParams = new URLSearchParams(params);
  const initialType = searchParams.get('type') || '';

  const [filters, setFilters] = useState<CourseFilters>({
    courseType: initialType as 'certification' | 'placement_guarantee' || '',
  });
  const [activeTab, setActiveTab] = useState<string>(
    initialType === 'placement_guarantee' ? 'placement' : 'certification'
  );
  const [page, setPage] = useState(1);
  const perPage = 8;

  // Fetch courses
  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ['/api/courses'],
  });

  // Filter courses based on selected filters
  const filteredCourses = courses.filter((course: any) => {
    // Course type filter
    if (filters.courseType && course.courseType !== filters.courseType) {
      return false;
    }

    // Category filter
    if (filters.category && course.category !== filters.category) {
      return false;
    }

    // Max price filter
    if (filters.maxPrice && course.price > filters.maxPrice) {
      return false;
    }

    // Min rating filter
    if (filters.minRating && course.rating < filters.minRating) {
      return false;
    }

    // Placement guarantee filter
    if (filters.placementGuarantee && !course.placementGuarantee) {
      return false;
    }

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const titleMatch = course.title.toLowerCase().includes(query);
      const descriptionMatch = course.description?.toLowerCase().includes(query);
      
      if (!titleMatch && !descriptionMatch) {
        return false;
      }
    }

    return true;
  });

  // Separate courses by type
  const certificationCourses = filteredCourses.filter(
    (course: any) => course.courseType === 'certification'
  );
  
  const placementCourses = filteredCourses.filter(
    (course: any) => course.courseType === 'placement_guarantee'
  );

  // Get current view's courses
  const currentCourses = activeTab === 'certification' ? certificationCourses : placementCourses;

  // Pagination
  const totalPages = Math.ceil(currentCourses.length / perPage);
  const displayedCourses = currentCourses.slice((page - 1) * perPage, page * perPage);

  const handleFilterChange = (newFilters: any) => {
    // Update tab if course type changes
    if (newFilters.courseType === 'certification') {
      setActiveTab('certification');
    } else if (newFilters.courseType === 'placement_guarantee') {
      setActiveTab('placement');
    }
    
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFilters({
      ...filters,
      courseType: value === 'certification' ? 'certification' : 'placement_guarantee'
    });
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filter Panel - 1/4 width on desktop */}
        <div className="w-full md:w-1/4">
          <FilterPanel 
            type="course"
            onFilter={handleFilterChange}
            defaultFilters={filters}
          />
        </div>
        
        {/* Course Listings - 3/4 width on desktop */}
        <div className="w-full md:w-3/4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
            {filteredCourses.length > 0 && (
              <p className="text-gray-500">
                Showing {displayedCourses.length} of {currentCourses.length} courses
              </p>
            )}
          </div>
          
          <Tabs 
            defaultValue={activeTab}
            value={activeTab}
            onValueChange={handleTabChange}
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="certification">Certification Courses</TabsTrigger>
              <TabsTrigger value="placement">Placement Guarantee</TabsTrigger>
            </TabsList>

            <TabsContent value="certification" className="pt-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
              ) : error ? (
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="text-red-800">Error loading courses. Please try again later.</p>
                </div>
              ) : certificationCourses.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No certification courses found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your filters to see more results.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({})}
                  >
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayedCourses.map((course: any) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="placement" className="pt-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
              ) : error ? (
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="text-red-800">Error loading courses. Please try again later.</p>
                </div>
              ) : placementCourses.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No placement guarantee courses found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your filters to see more results.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({})}
                  >
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {displayedCourses.map((course: any) => (
                    <PlacementCourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={page === i + 1 ? "default" : "outline"}
                    onClick={() => setPage(i + 1)}
                    className={page === i + 1 ? "bg-primary-600" : ""}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;
