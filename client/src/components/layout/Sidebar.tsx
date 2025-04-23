import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { 
  LayoutDashboard, User, Briefcase, BookOpen, 
  Settings, ChevronRight, LogOut
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className = '' }: SidebarProps) => {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const studentNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Applications', href: '/applications', icon: Briefcase },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const employerNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Company Profile', href: '/profile', icon: User },
    { name: 'Post Internship', href: '/post-internship', icon: Briefcase },
    { name: 'Post Job', href: '/post-job', icon: Briefcase },
    { name: 'Applications', href: '/applications', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const navigation = user.userType === 'employer' ? employerNavigation : studentNavigation;

  return (
    <div className={`bg-white border-r border-gray-200 h-full ${className}`}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md group ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon 
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-primary-700' : 'text-gray-400 group-hover:text-gray-500'
                  }`} 
                />
                {item.name}
                {isActive && (
                  <ChevronRight className="ml-auto h-4 w-4 text-primary-700" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => logout()}
            className="flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 w-full"
          >
            <LogOut className="mr-3 h-5 w-5 text-red-500" />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
