import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import FilterPanel from '@/components/ui/FilterPanel';
import InternshipCard from '@/components/ui/InternshipCard';
import { Button } from '@/components/ui/button';
import { InternshipFilters } from '@/lib/types';

const Internships = () => {
  const [savedInternships, setSavedInternships] = useState<number[]>([]);
  const [filters, setFilters] = useState<InternshipFilters>({});
  const [page, setPage] = useState(1);
  const perPage = 9;

  // Fetch internships
  const { data: internships = [], isLoading, error } = useQuery({
    queryKey: ['/api/internships'],
  });

  // Filter internships based on selected filters
  const filteredInternships = internships.filter((internship: any) => {
    // Location filter
    if (filters.location && internship.location !== filters.location && 
        !(filters.location === 'Work from Home' && internship.isRemote)) {
      return false;
    }

    // Work from home filter
    if (filters.isRemote && !internship.isRemote) {
      return false;
    }

    // Part-time filter
    if (filters.isPartTime && !internship.isPartTime) {
      return false;
    }

    // Min stipend filter
    if (filters.minStipend && internship.stipendAmount < filters.minStipend) {
      return false;
    }

    // Duration filter
    if (filters.durationMonths && internship.durationMonths.toString() !== filters.durationMonths) {
      return false;
    }

    // Job offer possibility filter
    if (filters.jobOfferPossibility && !internship.jobOfferPossibility) {
      return false;
    }

    // Skills filter
    if (filters.skills && filters.skills.length > 0) {
      const internshipSkills = internship.skillsRequired || [];
      if (!filters.skills.every(skill => 
        internshipSkills.some((s: string) => 
          s.toLowerCase().includes(skill.toLowerCase())
        )
      )) {
        return false;
      }
    }

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const titleMatch = internship.title.toLowerCase().includes(query);
      const descriptionMatch = internship.description?.toLowerCase().includes(query);
      const companyMatch = internship.employer?.companyName.toLowerCase().includes(query);
      
      if (!titleMatch && !descriptionMatch && !companyMatch) {
        return false;
      }
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInternships.length / perPage);
  const displayedInternships = filteredInternships.slice((page - 1) * perPage, page * perPage);

  const handleSaveInternship = (id: number) => {
    setSavedInternships(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filter Panel - 1/4 width on desktop */}
        <div className="w-full md:w-1/4">
          <FilterPanel 
            type="internship"
            onFilter={handleFilterChange}
            defaultFilters={filters}
          />
        </div>
        
        {/* Internship Listings - 3/4 width on desktop */}
        <div className="w-full md:w-3/4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Internships</h1>
            {filteredInternships.length > 0 && (
              <p className="text-gray-500">
                Showing {displayedInternships.length} of {filteredInternships.length} internships
              </p>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-red-800">Error loading internships. Please try again later.</p>
            </div>
          ) : filteredInternships.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No internships found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters to see more results.</p>
              <Button 
                variant="outline" 
                onClick={() => setFilters({})}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                {displayedInternships.map((internship: any) => (
                  <InternshipCard 
                    key={internship.id} 
                    internship={internship} 
                    onSave={handleSaveInternship}
                  />
                ))}
              </div>
              
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Internships;
