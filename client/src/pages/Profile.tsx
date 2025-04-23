import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import ResumeBuilder from '@/components/ui/ResumeBuilder';

interface ProfileData {
  user: any;
  profile: any;
  skills: any[];
  experiences: any[];
  educations: any[];
}

const Profile = () => {
  const { user } = useAuth();
  const [updatedCount, setUpdatedCount] = useState(0);
  
  // Fetch user profile data
  const { data: profileData, isLoading, refetch } = useQuery<ProfileData>({
    queryKey: ['/api/profile'],
  });

  // Extract profile data
  const profile = profileData?.profile;
  const skills = profileData?.skills || [];
  const experiences = profileData?.experiences || [];
  const educations = profileData?.educations || [];

  const handleProfileUpdate = () => {
    setUpdatedCount(prev => prev + 1);
    refetch();
  };

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar className="w-64 h-screen sticky top-0 hidden md:block" />
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Profile & Resume</h1>
            <p className="text-gray-500">Build your profile to stand out to recruiters</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-6">
            <div className="p-6">
              <ResumeBuilder 
                profile={profile}
                skills={skills}
                experiences={experiences}
                educations={educations}
                onUpdate={handleProfileUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;