import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import FilterPanel from '@/components/ui/FilterPanel';
import JobCard from '@/components/ui/JobCard';
import { Button } from '@/components/ui/button';
import { JobFilters } from '@/lib/types';

const Jobs = () => {
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [filters, setFilters] = useState<JobFilters>({});
  const [page, setPage] = useState(1);
  const perPage = 9;

  // Fetch jobs
  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['/api/jobs'],
  });

  // Filter jobs based on selected filters
  const filteredJobs = jobs.filter((job: any) => {
    // Location filter
    if (filters.location && job.location !== filters.location && 
        !(filters.location === 'Work from Home' && job.isRemote)) {
      return false;
    }

    // Work from home filter
    if (filters.isRemote && !job.isRemote) {
      return false;
    }

    // Salary range filter
    if (filters.minSalary && (!job.salaryMin || job.salaryMin < filters.minSalary * 100000)) {
      return false;
    }
    if (filters.maxSalary && (!job.salaryMax || job.salaryMax > filters.maxSalary * 100000)) {
      return false;
    }

    // Experience filter
    if (filters.experienceRequiredYears && 
        job.experienceRequiredYears > parseInt(filters.experienceRequiredYears as string)) {
      return false;
    }

    // Fresher job filter
    if (filters.isFresherJob && !job.isFresherJob) {
      return false;
    }

    // Skills filter
    if (filters.skills && filters.skills.length > 0) {
      const jobSkills = job.skillsRequired || [];
      if (!filters.skills.every(skill => 
        jobSkills.some((s: string) => 
          s.toLowerCase().includes(skill.toLowerCase())
        )
      )) {
        return false;
      }
    }

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const titleMatch = job.title.toLowerCase().includes(query);
      const descriptionMatch = job.description?.toLowerCase().includes(query);
      const companyMatch = job.employer?.companyName.toLowerCase().includes(query);
      
      if (!titleMatch && !descriptionMatch && !companyMatch) {
        return false;
      }
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / perPage);
  const displayedJobs = filteredJobs.slice((page - 1) * perPage, page * perPage);

  const handleSaveJob = (id: number) => {
    setSavedJobs(prev => 
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
            type="job"
            onFilter={handleFilterChange}
            defaultFilters={filters}
          />
        </div>
        
        {/* Job Listings - 3/4 width on desktop */}
        <div className="w-full md:w-3/4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
            {filteredJobs.length > 0 && (
              <p className="text-gray-500">
                Showing {displayedJobs.length} of {filteredJobs.length} jobs
              </p>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-red-800">Error loading jobs. Please try again later.</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
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
                {displayedJobs.map((job: any) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onSave={handleSaveJob}
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

export default Jobs;
