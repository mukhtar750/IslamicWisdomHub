import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertUserSchema } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenText } from 'lucide-react';

// Login schema
const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Registration schema extending the insert schema
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('login');
  
  // Safely use language context
  let isRtl = false;
  try {
    const { isRtl: rtlValue } = useLanguage();
    isRtl = rtlValue;
  } catch (error) {
    console.error("Language context error:", error);
  }
  
  // Safely use auth context
  let user = null;
  let loginMutation: any = { mutate: (_: any) => {}, isPending: false };
  let registerMutation: any = { mutate: (_: any) => {}, isPending: false };
  
  try {
    const auth = useAuth();
    user = auth.user;
    loginMutation = auth.loginMutation;
    registerMutation = auth.registerMutation;
  } catch (error) {
    console.error("Auth context error:", error);
  }
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      fullName: '',
      role: 'user',
    },
  });
  
  // Handle login submission
  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };
  
  // Handle registration submission
  const onRegisterSubmit = (values: RegisterFormValues) => {
    // Remove confirmPassword as it's not expected by the API
    const { confirmPassword, ...registrationData } = values;
    registerMutation.mutate(registrationData);
  };
  
  // Redirect to home if already logged in
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[80vh]">
      {/* Left column: Auth forms */}
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">{t('common.login')}</TabsTrigger>
              <TabsTrigger value="register">{t('common.register')}</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <CardHeader>
                <CardTitle>{t('auth.loginTitle')}</CardTitle>
                <CardDescription>{t('auth.loginSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('common.username')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('common.username')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('common.password')}</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder={t('common.password')}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-accent"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? t('common.loading') : t('common.login')}
                    </Button>
                    
                    <div className="text-sm text-center mt-4">
                      <span>{t('auth.dontHaveAccount')} </span>
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => setActiveTab('register')}
                      >
                        {t('common.register')}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register">
              <CardHeader>
                <CardTitle>{t('auth.registerTitle')}</CardTitle>
                <CardDescription>{t('auth.registerSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('common.fullName')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('common.fullName')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('common.username')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('common.username')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('common.email')}</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder={t('common.email')}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('common.password')}</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder={t('common.password')}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('common.confirmPassword')}</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder={t('common.confirmPassword')}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-accent"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? t('common.loading') : t('common.register')}
                    </Button>
                    
                    <div className="text-sm text-center mt-4">
                      <span>{t('auth.alreadyHaveAccount')} </span>
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => setActiveTab('login')}
                      >
                        {t('common.login')}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      {/* Right column: Hero section */}
      <div className="hidden md:flex flex-col items-center justify-center bg-primary/5 p-8 rounded-xl">
        <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <BookOpenText className="h-12 w-12 text-primary" />
        </div>
        
        <h2 className={`text-3xl font-bold mb-4 text-center ${isRtl ? 'font-amiri' : 'font-roboto'}`}>
          {t('common.appName')}
        </h2>
        
        <p className="text-lg text-center mb-8 max-w-md">
          {t('auth.registerSubtitle')}
        </p>
        
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-medium text-primary mb-2">Access to Islamic Knowledge</h3>
            <p className="text-sm text-gray-600">Browse our extensive collection of Islamic literature</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-medium text-primary mb-2">AI-Powered Assistant</h3>
            <p className="text-sm text-gray-600">Get answers to your Islamic questions with proper references</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-medium text-primary mb-2">Personal Bookshelf</h3>
            <p className="text-sm text-gray-600">Track your borrowed books and save favorites</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-medium text-primary mb-2">Bilingual Support</h3>
            <p className="text-sm text-gray-600">Access content in both English and Arabic</p>
          </div>
        </div>
      </div>
    </div>
  );
}
