import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, X, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'application' | 'job' | 'system' | 'alert';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  action?: {
    label: string;
    href: string;
  };
}

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'application',
      title: 'Application Update',
      message: 'Your application for Software Engineer at Tech Corp has been reviewed',
      read: false,
      createdAt: new Date().toISOString(),
      action: {
        label: 'View Application',
        href: '/applications/1'
      }
    },
    {
      id: '2',
      type: 'job',
      title: 'New Job Alert',
      message: 'A new job matching your profile has been posted: Frontend Developer at Design Co',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      action: {
        label: 'View Job',
        href: '/jobs/1'
      }
    },
    {
      id: '3',
      type: 'system',
      title: 'Profile Update Required',
      message: 'Please complete your profile to increase your chances of getting hired',
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      action: {
        label: 'Update Profile',
        href: '/profile'
      }
    }
  ]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'application':
        return <Bell className="h-5 w-5 text-blue-500" />;
      case 'job':
        return <Bell className="h-5 w-5 text-green-500" />;
      case 'system':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar className="w-64 h-screen sticky top-0 hidden md:block" />
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
              disabled={notifications.every(n => n.read)}
            >
              Mark all as read
            </Button>
          </div>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications yet</p>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`relative ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h3 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h3>
                          <div className="flex space-x-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {notification.message}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          {notification.action && (
                            <Button
                              variant="link"
                              size="sm"
                              className="text-primary"
                              onClick={() => window.location.href = notification.action!.href}
                            >
                              {notification.action.label}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications; 