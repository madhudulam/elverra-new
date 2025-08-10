
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import LoginForm from '@/components/auth/LoginForm';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Login = () => {
  return (
    <Layout>
      <PremiumBanner
        title="Welcome Back"
        description="Sign in to access your Elverra client benefits and exclusive features."
        backgroundImage="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        variant="compact"
      />
      
      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Login illustration"
                className="rounded-lg shadow-xl w-full h-96 object-cover"
              />
            </div>
            
            <div className="order-1 lg:order-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Welcome back</CardTitle>
                  <CardDescription>
                    Sign in to access your Elverra member benefits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LoginForm />
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="text-sm text-center">
                    <Link to="/forgot-password" className="text-purple-600 hover:underline">
                      Forgot your password?
                    </Link>
                  </div>
                  <div className="text-sm text-center">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-purple-600 hover:underline">
                      Join Elverra now
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
