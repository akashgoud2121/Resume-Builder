'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthActions } from '@/firebase/auth/use-auth';

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type AuthFormProps = {
  mode: 'login' | 'signup';
};

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="24px"
    height="24px"
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.126,44,30.023,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);

const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.89 1.53 2.34 1.09 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.95c0-1.1.39-1.99 1.03-2.69c-.1-.25-.45-1.27.1-2.65c0 0 .84-.27 2.75 1.02A9.58 9.58 0 0 1 12 6.84c.85 0 1.7.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.38.2 2.4.1 2.65c.64.7 1.03 1.59 1.03 2.69c0 3.85-2.34 4.7-4.57 4.95c.36.31.68.92.68 1.85v2.72c0 .27.18.58.69.48A10 10 0 0 0 22 12A10 10 0 0 0 12 2"/>
    </svg>
);


export function AuthForm({ mode }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { signUp, signIn, signInWithGoogle, signInWithGitHub } = useAuthActions();

  const emailSchema = mode === 'signup' ? signupSchema : loginSchema;
  type EmailFormData = z.infer<typeof emailSchema>;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      if (mode === 'signup') {
        const { name, email, password } = data as z.infer<typeof signupSchema>;
        await signUp(email, password, name);
        toast({
          title: 'Account Created',
          description: "You've been successfully signed up!",
        });
        router.push('/');
      } else {
        await signIn(data.email, data.password);
        toast({
          title: 'Logged In',
          description: "You've been successfully logged in!",
        });
        router.push('/');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description:
          error.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
        await signInWithGoogle();
        toast({
          title: 'Logged In',
          description: "You've been successfully logged in with Google!",
        });
        router.push('/');
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Google Sign-In Failed',
            description: error.message || 'Could not sign in with Google. Please try again.',
        });
    } finally {
        setIsGoogleLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setIsGitHubLoading(true);
    try {
        await signInWithGitHub();
        toast({
          title: 'Logged In',
          description: "You've been successfully logged in with GitHub!",
        });
        router.push('/');
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'GitHub Sign-In Failed',
            description: error.message || 'Could not sign in with GitHub. Please try again.',
        });
    } finally {
        setIsGitHubLoading(false);
    }
  };

  return (
    <div className="space-y-6">
        <div className="space-y-2">
            <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading || isGitHubLoading}
            >
                {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <GoogleIcon className="mr-2 h-5 w-5" />
                )}
                Continue with Google
            </Button>
            <Button
                variant="outline"
                className="w-full"
                onClick={handleGitHubSignIn}
                disabled={isLoading || isGoogleLoading || isGitHubLoading}
            >
                {isGitHubLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <GitHubIcon className="mr-2 h-5 w-5" />
                )}
                Continue with GitHub
            </Button>
        </div>
      
      <div id="recaptcha-container"></div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

       
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {mode === 'signup' && (
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
            </div>
            )}
            <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
            </div>
            <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
            </div>
            {mode === 'signup' && (
            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                </p>
                )}
            </div>
            )}
            <div>
            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading || isGitHubLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'signup' ? 'Sign Up' : 'Sign In'}
            </Button>
            </div>
        </form>
    </div>
  );
}
