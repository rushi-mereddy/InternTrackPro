import { useState } from 'react';
import { 
  Card, CardContent, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, Briefcase, DollarSign, Calendar, Home, Clock, Search, 
  GraduationCap, BadgeCheck, X, Filter, Star
} from 'lucide-react';
import { LOCATIONS, POPULAR_SKILLS, DURATION_OPTIONS } from '@/lib/constants';

interface FilterPanelProps {
  type: 'internship' | 'job' | 'course';
  onFilter: (filters: any) => void;
  defaultFilters?: any;
}

const FilterPanel = ({ type, onFilter, defaultFilters = {} }: FilterPanelProps) => {
  const [filters, setFilters] = useState({
    location: defaultFilters.location || '',
    isRemote: defaultFilters.isRemote || false,
    isPartTime: defaultFilters.isPartTime || false,
    minStipend: defaultFilters.minStipend || 0,
    minSalary: defaultFilters.minSalary || 0,
    maxSalary: defaultFilters.maxSalary || 20,
    durationMonths: defaultFilters.durationMonths || '',
    experienceRequiredYears: defaultFilters.experienceRequiredYears || '',
    isFresherJob: defaultFilters.isFresherJob || false,
    jobOfferPossibility: defaultFilters.jobOfferPossibility || false,
    skills: defaultFilters.skills || [],
    courseType: defaultFilters.courseType || '',
    category: defaultFilters.category || '',
    maxPrice: defaultFilters.maxPrice || 10000,
    minRating: defaultFilters.minRating || 0,
    placementGuarantee: defaultFilters.placementGuarantee || false,
    searchQuery: defaultFilters.searchQuery || '',
  });
  
  const [selectedSkillInput, setSelectedSkillInput] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAddSkill = () => {
    if (selectedSkillInput && !filters.skills.includes(selectedSkillInput)) {
      handleFilterChange('skills', [...filters.skills, selectedSkillInput]);
      setSelectedSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    handleFilterChange('skills', filters.skills.filter((s: string) => s !== skill));
  };

  const handleApplyFilters = () => {
    onFilter(filters);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      location: '',
      isRemote: false,
      isPartTime: false,
      minStipend: 0,
      minSalary: 0,
      maxSalary: 20,
      durationMonths: '',
      experienceRequiredYears: '',
      isFresherJob: false,
      jobOfferPossibility: false,
      skills: [],
      courseType: '',
      category: '',
      maxPrice: 10000,
      minRating: 0,
      placementGuarantee: false,
      searchQuery: '',
    };
    
    setFilters(defaultFilters);
    onFilter(defaultFilters);
  };

  return (
    <>
      {/* Mobile filter button */}
      <div className="md:hidden mb-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      <Card className={`${showMobileFilters ? 'block' : 'hidden'} md:block bg-white overflow-hidden`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center justify-between">
            <span>Filter {type === 'internship' ? 'Internships' : type === 'job' ? 'Jobs' : 'Courses'}</span>
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setShowMobileFilters(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <div>
            <Label htmlFor="searchQuery" className="text-sm font-medium mb-1.5 block">
              Search
            </Label>
            <div className="relative">
              <Input
                id="searchQuery"
                placeholder={`Search ${type === 'internship' ? 'internships' : type === 'job' ? 'jobs' : 'courses'}...`}
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Location filters - for internships and jobs */}
          {(type === 'internship' || type === 'job') && (
            <div>
              <Label className="text-sm font-medium mb-1.5 block flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-500" /> Location
              </Label>
              <Select
                value={filters.location}
                onValueChange={(value) => handleFilterChange('location', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Location</SelectItem>
                  {LOCATIONS.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isRemote"
                    checked={filters.isRemote}
                    onCheckedChange={(checked) => 
                      handleFilterChange('isRemote', checked === true)
                    }
                  />
                  <Label htmlFor="isRemote" className="text-sm flex items-center">
                    <Home className="h-3 w-3 mr-1 text-gray-500" /> Work from Home
                  </Label>
                </div>
                
                {type === 'internship' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isPartTime"
                      checked={filters.isPartTime}
                      onCheckedChange={(checked) => 
                        handleFilterChange('isPartTime', checked === true)
                      }
                    />
                    <Label htmlFor="isPartTime" className="text-sm flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-gray-500" /> Part-time
                    </Label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stipend filter - for internships */}
          {type === 'internship' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-sm font-medium flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-gray-500" /> Min. Stipend
                </Label>
                <span className="text-sm font-medium text-primary-600">
                  ₹{filters.minStipend.toLocaleString()}/month
                </span>
              </div>
              <Slider
                value={[filters.minStipend]}
                min={0}
                max={50000}
                step={1000}
                onValueChange={(values) => handleFilterChange('minStipend', values[0])}
                className="my-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>₹0</span>
                <span>₹50,000</span>
              </div>
            </div>
          )}

          {/* Duration filter - for internships */}
          {type === 'internship' && (
            <div>
              <Label className="text-sm font-medium mb-1.5 block flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-gray-500" /> Duration
              </Label>
              <Select
                value={filters.durationMonths}
                onValueChange={(value) => handleFilterChange('durationMonths', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Duration</SelectItem>
                  {DURATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Salary filter - for jobs */}
          {type === 'job' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-sm font-medium flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-gray-500" /> Salary Range (LPA)
                </Label>
                <span className="text-sm font-medium text-primary-600">
                  ₹{filters.minSalary} - ₹{filters.maxSalary}+ LPA
                </span>
              </div>
              <Slider
                value={[filters.minSalary, filters.maxSalary]}
                min={0}
                max={50}
                step={1}
                onValueChange={(values) => {
                  handleFilterChange('minSalary', values[0]);
                  handleFilterChange('maxSalary', values[1]);
                }}
                className="my-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>₹0 LPA</span>
                <span>₹50+ LPA</span>
              </div>
            </div>
          )}

          {/* Experience filter - for jobs */}
          {type === 'job' && (
            <div>
              <Label className="text-sm font-medium mb-1.5 block flex items-center">
                <Briefcase className="h-4 w-4 mr-1 text-gray-500" /> Experience
              </Label>
              <Select
                value={filters.experienceRequiredYears}
                onValueChange={(value) => handleFilterChange('experienceRequiredYears', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Experience</SelectItem>
                  <SelectItem value="0">0 Years</SelectItem>
                  <SelectItem value="1">1+ Years</SelectItem>
                  <SelectItem value="2">2+ Years</SelectItem>
                  <SelectItem value="3">3+ Years</SelectItem>
                  <SelectItem value="5">5+ Years</SelectItem>
                  <SelectItem value="10">10+ Years</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="mt-2 flex items-center space-x-2">
                <Checkbox 
                  id="isFresherJob"
                  checked={filters.isFresherJob}
                  onCheckedChange={(checked) => 
                    handleFilterChange('isFresherJob', checked === true)
                  }
                />
                <Label htmlFor="isFresherJob" className="text-sm flex items-center">
                  <GraduationCap className="h-3 w-3 mr-1 text-gray-500" /> Fresher Jobs
                </Label>
              </div>
            </div>
          )}

          {/* Additional internship options */}
          {type === 'internship' && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="jobOfferPossibility"
                checked={filters.jobOfferPossibility}
                onCheckedChange={(checked) => 
                  handleFilterChange('jobOfferPossibility', checked === true)
                }
              />
              <Label htmlFor="jobOfferPossibility" className="text-sm flex items-center">
                <BadgeCheck className="h-3 w-3 mr-1 text-gray-500" /> With job offer
              </Label>
            </div>
          )}

          {/* Course filters */}
          {type === 'course' && (
            <>
              <div>
                <Label className="text-sm font-medium mb-1.5 block flex items-center">
                  <BadgeCheck className="h-4 w-4 mr-1 text-gray-500" /> Course Type
                </Label>
                <Select
                  value={filters.courseType}
                  onValueChange={(value) => handleFilterChange('courseType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    <SelectItem value="certification">Certification Courses</SelectItem>
                    <SelectItem value="placement_guarantee">Placement Guarantee Courses</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="mt-2 flex items-center space-x-2">
                  <Checkbox 
                    id="placementGuarantee"
                    checked={filters.placementGuarantee}
                    onCheckedChange={(checked) => 
                      handleFilterChange('placementGuarantee', checked === true)
                    }
                  />
                  <Label htmlFor="placementGuarantee" className="text-sm flex items-center">
                    <BadgeCheck className="h-3 w-3 mr-1 text-gray-500" /> Placement Guaranteed
                  </Label>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-1.5 block flex items-center">
                  <Briefcase className="h-4 w-4 mr-1 text-gray-500" /> Category
                </Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="programming">Programming</SelectItem>
                    <SelectItem value="data_science">Data Science</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="business">Business & Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-sm font-medium flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-gray-500" /> Max. Price
                  </Label>
                  <span className="text-sm font-medium text-primary-600">
                    ₹{filters.maxPrice.toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={[filters.maxPrice]}
                  min={0}
                  max={50000}
                  step={1000}
                  onValueChange={(values) => handleFilterChange('maxPrice', values[0])}
                  className="my-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>₹0</span>
                  <span>₹50,000</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 mr-1 text-gray-500" /> Min. Rating
                  </Label>
                  <span className="text-sm font-medium text-primary-600">
                    {filters.minRating === 0 ? 'Any' : `${filters.minRating / 10} / 5`}
                  </span>
                </div>
                <Slider
                  value={[filters.minRating]}
                  min={0}
                  max={50}
                  step={5}
                  onValueChange={(values) => handleFilterChange('minRating', values[0])}
                  className="my-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Any</span>
                  <span>5.0</span>
                </div>
              </div>
            </>
          )}

          {/* Skills filter - for all types */}
          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              Skills
            </Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add a skill"
                value={selectedSkillInput}
                onChange={(e) => setSelectedSkillInput(e.target.value)}
                className="flex-grow"
              />
              <Button 
                variant="outline" 
                onClick={handleAddSkill}
                disabled={!selectedSkillInput}
              >
                Add
              </Button>
            </div>
            
            {filters.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.skills.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Popular skills:</p>
              <div className="flex flex-wrap gap-1">
                {POPULAR_SKILLS.slice(0, 8).map((skill) => (
                  <Badge 
                    key={skill}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      if (!filters.skills.includes(skill)) {
                        handleFilterChange('skills', [...filters.skills, skill])
                      }
                    }}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0 flex flex-col gap-2">
          <Button 
            className="w-full bg-primary-600 hover:bg-primary-700" 
            onClick={handleApplyFilters}
          >
            Apply Filters
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleResetFilters}
          >
            Reset Filters
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default FilterPanel;
