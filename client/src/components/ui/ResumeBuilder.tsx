import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, PenSquare, PlusCircle, Calendar, Briefcase, 
  GraduationCap, Award, FileText, User, Github
} from 'lucide-react';
import { POPULAR_SKILLS } from '@/lib/constants';

interface ResumeBuilderProps {
  profile: any;
  skills?: any[];
  experiences?: any[];
  educations?: any[];
  onUpdate?: () => void;
}

const ResumeBuilder = ({
  profile,
  skills = [],
  experiences = [],
  educations = [],
  onUpdate
}: ResumeBuilderProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('personal');
  const [editingSkill, setEditingSkill] = useState<any | null>(null);
  const [editingExperience, setEditingExperience] = useState<any | null>(null);
  const [editingEducation, setEditingEducation] = useState<any | null>(null);

  // Personal info form
  const personalInfoSchema = z.object({
    careerObjective: z.string().optional(),
  });
  
  const personalInfoForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      careerObjective: profile?.careerObjective || '',
    },
  });

  // Education form
  const educationSchema = z.object({
    degree: z.string().min(2, { message: "Degree is required" }),
    institution: z.string().min(2, { message: "Institution is required" }),
    startYear: z.string().refine(val => !isNaN(Number(val)), {
      message: "Start year must be a number",
    }),
    endYear: z.string().refine(val => !val || !isNaN(Number(val)), {
      message: "End year must be a number",
    }).optional(),
    grade: z.string().optional(),
    description: z.string().optional(),
  });
  
  const educationForm = useForm<z.infer<typeof educationSchema>>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      degree: editingEducation?.degree || '',
      institution: editingEducation?.institution || '',
      startYear: editingEducation?.startYear?.toString() || '',
      endYear: editingEducation?.endYear?.toString() || '',
      grade: editingEducation?.grade || '',
      description: editingEducation?.description || '',
    },
  });

  // Experience form
  const experienceSchema = z.object({
    title: z.string().min(2, { message: "Title is required" }),
    company: z.string().min(2, { message: "Company name is required" }),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isCurrent: z.boolean().optional(),
    description: z.string().optional(),
    type: z.enum(['job', 'internship', 'project']),
  });
  
  const experienceForm = useForm<z.infer<typeof experienceSchema>>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      title: editingExperience?.title || '',
      company: editingExperience?.company || '',
      location: editingExperience?.location || '',
      startDate: editingExperience?.startDate 
        ? new Date(editingExperience.startDate).toISOString().slice(0, 10) 
        : '',
      endDate: editingExperience?.endDate 
        ? new Date(editingExperience.endDate).toISOString().slice(0, 10) 
        : '',
      isCurrent: editingExperience?.isCurrent || false,
      description: editingExperience?.description || '',
      type: editingExperience?.type || 'internship',
    },
  });

  // Skill form
  const skillSchema = z.object({
    skillName: z.string().min(2, { message: "Skill name is required" }),
    proficiency: z.enum(['beginner', 'intermediate', 'expert']).optional(),
  });
  
  const skillForm = useForm<z.infer<typeof skillSchema>>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      skillName: editingSkill?.skillName || '',
      proficiency: editingSkill?.proficiency || 'intermediate',
    },
  });

  // Handle form submissions
  const onPersonalInfoSubmit = async (data: z.infer<typeof personalInfoSchema>) => {
    try {
      await apiRequest('PUT', '/api/profile/student', data);
      toast({
        title: "Profile updated",
        description: "Your career objective has been updated successfully.",
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onEducationSubmit = async (data: z.infer<typeof educationSchema>) => {
    try {
      if (editingEducation) {
        await apiRequest('PUT', `/api/profile/educations/${editingEducation.id}`, {
          ...data,
          startYear: parseInt(data.startYear),
          endYear: data.endYear ? parseInt(data.endYear) : undefined,
        });
        toast({
          title: "Education updated",
          description: "Your education details have been updated.",
        });
      } else {
        await apiRequest('POST', '/api/profile/educations', {
          ...data,
          startYear: parseInt(data.startYear),
          endYear: data.endYear ? parseInt(data.endYear) : undefined,
        });
        toast({
          title: "Education added",
          description: "Your education details have been added.",
        });
      }
      
      setEditingEducation(null);
      educationForm.reset();
      if (onUpdate) onUpdate();
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save education details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onExperienceSubmit = async (data: z.infer<typeof experienceSchema>) => {
    try {
      if (editingExperience) {
        await apiRequest('PUT', `/api/profile/experiences/${editingExperience.id}`, data);
        toast({
          title: "Experience updated",
          description: "Your experience details have been updated.",
        });
      } else {
        await apiRequest('POST', '/api/profile/experiences', data);
        toast({
          title: "Experience added",
          description: "Your experience details have been added.",
        });
      }
      
      setEditingExperience(null);
      experienceForm.reset();
      if (onUpdate) onUpdate();
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save experience details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSkillSubmit = async (data: z.infer<typeof skillSchema>) => {
    try {
      if (editingSkill) {
        await apiRequest('PUT', `/api/profile/skills/${editingSkill.id}`, data);
        toast({
          title: "Skill updated",
          description: "Your skill has been updated.",
        });
      } else {
        await apiRequest('POST', '/api/profile/skills', data);
        toast({
          title: "Skill added",
          description: "Your skill has been added.",
        });
      }
      
      setEditingSkill(null);
      skillForm.reset();
      if (onUpdate) onUpdate();
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save skill. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEducation = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/profile/educations/${id}`, {});
      toast({
        title: "Education removed",
        description: "Your education details have been removed.",
      });
      if (onUpdate) onUpdate();
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove education. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteExperience = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/profile/experiences/${id}`, {});
      toast({
        title: "Experience removed",
        description: "Your experience details have been removed.",
      });
      if (onUpdate) onUpdate();
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove experience. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSkill = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/profile/skills/${id}`, {});
      toast({
        title: "Skill removed",
        description: "Your skill has been removed.",
      });
      if (onUpdate) onUpdate();
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove skill. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditEducation = (education: any) => {
    setEditingEducation(education);
    educationForm.reset({
      degree: education.degree,
      institution: education.institution,
      startYear: education.startYear?.toString() || '',
      endYear: education.endYear?.toString() || '',
      grade: education.grade || '',
      description: education.description || '',
    });
  };

  const handleEditExperience = (experience: any) => {
    setEditingExperience(experience);
    experienceForm.reset({
      title: experience.title,
      company: experience.company,
      location: experience.location || '',
      startDate: experience.startDate 
        ? new Date(experience.startDate).toISOString().slice(0, 10) 
        : '',
      endDate: experience.endDate 
        ? new Date(experience.endDate).toISOString().slice(0, 10) 
        : '',
      isCurrent: experience.isCurrent || false,
      description: experience.description || '',
      type: experience.type,
    });
  };

  const handleEditSkill = (skill: any) => {
    setEditingSkill(skill);
    skillForm.reset({
      skillName: skill.skillName,
      proficiency: skill.proficiency || 'intermediate',
    });
  };

  const handleCancelEducation = () => {
    setEditingEducation(null);
    educationForm.reset();
  };

  const handleCancelExperience = () => {
    setEditingExperience(null);
    experienceForm.reset();
  };

  const handleCancelSkill = () => {
    setEditingSkill(null);
    skillForm.reset();
  };

  const suggestSkill = (skill: string) => {
    skillForm.setValue('skillName', skill);
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Resume Builder
        </CardTitle>
        <CardDescription>
          Build your resume to apply for internships and jobs. Employers will see this resume when you apply.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="personal" className="flex items-center">
              <User className="h-4 w-4 mr-2" /> Personal
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center">
              <GraduationCap className="h-4 w-4 mr-2" /> Education
            </TabsTrigger>
            <TabsTrigger value="experience" className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2" /> Experience
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center">
              <Award className="h-4 w-4 mr-2" /> Skills
            </TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal">
            <Form {...personalInfoForm}>
              <form onSubmit={personalInfoForm.handleSubmit(onPersonalInfoSubmit)} className="space-y-4">
                <FormField
                  control={personalInfoForm.control}
                  name="careerObjective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Career Objective</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Write a brief summary about your career goals and strengths..." 
                          className="min-h-32"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        This will appear at the top of your resume. Keep it concise and relevant.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="bg-primary-600 hover:bg-primary-700">
                  Save Career Objective
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education">
            <div className="space-y-6">
              {/* List of existing educations */}
              {educations.length > 0 ? (
                <div className="space-y-4">
                  {educations.map((education) => (
                    <div key={education.id} className="p-4 border rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{education.degree}</h4>
                          <p className="text-sm text-gray-600">{education.institution}</p>
                          <p className="text-xs text-gray-500">
                            {education.startYear} - {education.endYear || 'Present'}
                            {education.grade && ` • Grade: ${education.grade}`}
                          </p>
                          {education.description && (
                            <p className="text-sm mt-1">{education.description}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditEducation(education)}
                          >
                            <PenSquare className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteEducation(education.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-md">
                  <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <h3 className="text-gray-500 font-medium">No Education Added</h3>
                  <p className="text-gray-400 text-sm">Add your educational qualification</p>
                </div>
              )}

              {/* Form to add/edit education */}
              <div className="border p-4 rounded-md">
                <h3 className="font-medium mb-4">
                  {editingEducation ? 'Edit Education' : 'Add Education'}
                </h3>
                <Form {...educationForm}>
                  <form onSubmit={educationForm.handleSubmit(onEducationSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={educationForm.control}
                        name="degree"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Degree/Course</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Bachelor of Technology" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={educationForm.control}
                        name="institution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institution</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. University of Delhi" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={educationForm.control}
                        name="startYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Year</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 2020" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={educationForm.control}
                        name="endYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Year (or expected)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 2024" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={educationForm.control}
                        name="grade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grade/CGPA</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 8.5/10" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={educationForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Add relevant achievements, courses, etc." 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-2">
                      <Button 
                        type="submit" 
                        className="bg-primary-600 hover:bg-primary-700"
                      >
                        {editingEducation ? 'Update Education' : 'Add Education'}
                      </Button>
                      {editingEducation && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleCancelEducation}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </TabsContent>

          {/* Experience Tab */}
          <TabsContent value="experience">
            <div className="space-y-6">
              {/* List of existing experiences */}
              {experiences.length > 0 ? (
                <div className="space-y-4">
                  {experiences.map((experience) => (
                    <div key={experience.id} className="p-4 border rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{experience.title}</h4>
                            <Badge variant="outline" className="capitalize">
                              {experience.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{experience.company}</p>
                          {experience.location && (
                            <p className="text-xs text-gray-500">{experience.location}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            {experience.startDate ? new Date(experience.startDate).toLocaleDateString() : ''} - 
                            {experience.isCurrent ? ' Present' : 
                              experience.endDate ? ` ${new Date(experience.endDate).toLocaleDateString()}` : ''}
                          </p>
                          {experience.description && (
                            <p className="text-sm mt-1">{experience.description}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditExperience(experience)}
                          >
                            <PenSquare className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteExperience(experience.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-md">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <h3 className="text-gray-500 font-medium">No Experience Added</h3>
                  <p className="text-gray-400 text-sm">Add your work experiences, internships, or projects</p>
                </div>
              )}

              {/* Form to add/edit experience */}
              <div className="border p-4 rounded-md">
                <h3 className="font-medium mb-4">
                  {editingExperience ? 'Edit Experience' : 'Add Experience'}
                </h3>
                <Form {...experienceForm}>
                  <form onSubmit={experienceForm.handleSubmit(onExperienceSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={experienceForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title/Position</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Software Developer Intern" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={experienceForm.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company/Organization</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Microsoft" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={experienceForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Bangalore" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={experienceForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="internship">Internship</SelectItem>
                                <SelectItem value="job">Job</SelectItem>
                                <SelectItem value="project">Project</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={experienceForm.control}
                        name="isCurrent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-end space-x-2">
                            <FormControl>
                              <input 
                                type="checkbox"
                                className="mr-2 h-4 w-4"
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Currently working here</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={experienceForm.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {!experienceForm.watch('isCurrent') && (
                        <FormField
                          control={experienceForm.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <FormField
                      control={experienceForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your responsibilities and achievements..." 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-2">
                      <Button 
                        type="submit" 
                        className="bg-primary-600 hover:bg-primary-700"
                      >
                        {editingExperience ? 'Update Experience' : 'Add Experience'}
                      </Button>
                      {editingExperience && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleCancelExperience}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills">
            <div className="space-y-6">
              {/* List of existing skills */}
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <div 
                      key={skill.id} 
                      className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                    >
                      <span className="text-sm">{skill.skillName}</span>
                      {skill.proficiency && (
                        <Badge 
                          variant="outline" 
                          className="ml-1 text-xs capitalize"
                        >
                          {skill.proficiency}
                        </Badge>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-1 h-5 w-5 p-0"
                        onClick={() => handleEditSkill(skill)}
                      >
                        <PenSquare className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-1 h-5 w-5 p-0 text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteSkill(skill.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-md">
                  <Award className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <h3 className="text-gray-500 font-medium">No Skills Added</h3>
                  <p className="text-gray-400 text-sm">Add skills to showcase your expertise</p>
                </div>
              )}

              {/* Form to add/edit skill */}
              <div className="border p-4 rounded-md">
                <h3 className="font-medium mb-4">
                  {editingSkill ? 'Edit Skill' : 'Add Skill'}
                </h3>
                <Form {...skillForm}>
                  <form onSubmit={skillForm.handleSubmit(onSkillSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={skillForm.control}
                        name="skillName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skill Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. JavaScript" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={skillForm.control}
                        name="proficiency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Proficiency Level</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select proficiency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="expert">Expert</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {!editingSkill && (
                      <div>
                        <p className="text-sm font-medium mb-2">Suggested Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {POPULAR_SKILLS.slice(0, 10).map((skill, index) => (
                            <Badge 
                              key={index}
                              variant="outline"
                              className="cursor-pointer hover:bg-gray-100"
                              onClick={() => suggestSkill(skill)}
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button 
                        type="submit" 
                        className="bg-primary-600 hover:bg-primary-700"
                      >
                        {editingSkill ? 'Update Skill' : 'Add Skill'}
                      </Button>
                      {editingSkill && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleCancelSkill}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </div>

              {/* GitHub projects section */}
              <div className="border p-4 rounded-md">
                <h3 className="font-medium mb-4 flex items-center">
                  <Github className="h-4 w-4 mr-2" />
                  Link GitHub Projects
                </h3>
                <div className="flex items-center space-x-2">
                  <Input placeholder="Your GitHub Username" />
                  <Button variant="outline" className="whitespace-nowrap">
                    <PlusCircle className="h-4 w-4 mr-2" /> Connect
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ResumeBuilder;
