import { useState } from 'react';
import { useLocation } from 'wouter';
import LoginForm from '../components/auth/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

const Login = () => {
  const [, setLocation] = useLocation();
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-16rem)] py-12 px-4">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <LoginForm />
            
            <div className="text-center text-sm mt-2">
              <span className="text-gray-500">Don't have an account?</span>{' '}
              <button 
                onClick={() => setLocation('/register')}
                className="text-primary-600 hover:text-primary-800 font-medium"
              >
                Sign up
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;