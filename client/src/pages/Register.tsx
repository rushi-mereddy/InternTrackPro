import { useState } from 'react';
import { useLocation } from 'wouter';
import RegisterForm from '../components/auth/RegisterForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

const Register = () => {
  const [, setLocation] = useLocation();
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-16rem)] py-12 px-4">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
            <CardDescription>
              Enter your details to create your account
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <RegisterForm />
            
            <div className="text-center text-sm mt-2">
              <span className="text-gray-500">Already have an account?</span>{' '}
              <button 
                onClick={() => setLocation('/login')}
                className="text-primary-600 hover:text-primary-800 font-medium"
              >
                Sign in
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;