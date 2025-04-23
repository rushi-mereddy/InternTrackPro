import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APPLICATION_STATUS } from '@/lib/constants';

interface Application {
  id: number;
  studentId: number;
  internshipId?: number;
  jobId?: number;
  status: string;
  appliedDate: string;
  coverLetter?: string;
  internship?: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    duration: string;
    stipend: string;
  };
  job?: {
    title: string;
    company: string;
    location: string;
    salary: string;
  };
}

interface ApplicationsData {
  applications: Application[];
}

const Applications = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  
  // Fetch applications data
  const { data, isLoading } = useQuery<ApplicationsData>({
    queryKey: ['/api/applications'],
  });

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const applications = data?.applications || [];

  // Filter applications based on active tab
  const filteredApplications = activeTab === 'all' 
    ? applications 
    : applications.filter(app => app.status.toLowerCase() === activeTab);

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar className="w-64 h-screen sticky top-0 hidden md:block" />
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
            <p className="text-gray-500">Track all your internship and job applications</p>
          </div>
          
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Applications</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {filteredApplications.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-white">
                  <p className="text-gray-500">No applications found.</p>
                  <Button variant="outline" className="mt-4">Browse Opportunities</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredApplications.map((application) => (
                    <Card key={application.id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50 border-b pb-3">
                        <CardTitle className="text-lg">
                          {application.internship ? application.internship.title : application.job?.title}
                        </CardTitle>
                        <CardDescription>
                          {application.internship ? application.internship.company : application.job?.company} • {application.internship ? application.internship.location : application.job?.location}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <p className="text-sm text-gray-500">Applied on</p>
                            <p className="font-medium">{new Date(application.appliedDate).toLocaleDateString()}</p>
                          </div>
                          {getStatusBadge(application.status)}
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-sm text-gray-500">
                            {application.internship 
                              ? `${application.internship.duration} • ${application.internship.stipend}/month`
                              : application.job 
                                ? `${application.job.salary}/year` 
                                : ''}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="bg-gray-50 border-t flex justify-between">
                        <Button variant="outline" size="sm">View Details</Button>
                        {application.status.toLowerCase() === 'accepted' && (
                          <Button size="sm">Accept Offer</Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Applications;