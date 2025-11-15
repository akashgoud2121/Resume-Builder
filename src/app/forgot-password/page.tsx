'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const passwordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type EmailFormData = z.infer<typeof emailSchema>;
type OtpFormData = z.infer<typeof otpSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
    reset: resetOtp,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(passwordValue);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  const onEmailSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send OTP');
      }

      setEmail(data.email);
      resetOtp(); // Clear any pre-filled values
      setStep('otp');
      toast({
        variant: 'success',
        title: 'OTP Sent',
        description: 'Please check your email for the password reset code.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Send OTP',
        description: error.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpSubmit = async (data: OtpFormData) => {
    setIsLoading(true);
    try {
      // Verify OTP by attempting a test reset (we'll verify it's valid)
      // Actually, we'll verify it when resetting password, but store it for now
      setOtp(data.otp);
      setStep('password');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.message || 'Invalid OTP code. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      if (!otp || otp.length !== 6) {
        throw new Error('OTP is required. Please go back and enter the OTP code.');
      }

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp,
          newPassword: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset password');
      }

      toast({
        variant: 'success',
        title: 'Password Reset Successful!',
        description: 'Your password has been reset. Please sign in with your new password.',
      });

      // Redirect to login page
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Reset Failed',
        description: error.message || 'Failed to reset password. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend OTP');
      }

      toast({
        variant: 'success',
        title: 'OTP Resent',
        description: 'A new password reset code has been sent to your email.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Resend Failed',
        description: error.message || 'Failed to resend OTP. Please try again.',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-background p-8 shadow-lg">
        <div>
          <Link href="/" className="flex items-center justify-center gap-3">
            <img
              src="/images/cognisys-logo.svg"
              alt="Cognisys AI Logo"
              className="h-10 w-10 object-contain rounded-md"
            />
            <h1 className="text-2xl font-bold font-headline">Cognisys AI Resume Builder</h1>
          </Link>
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-foreground">
            Reset Your Password
          </h2>
        </div>

        {step === 'email' && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground text-center">
              Enter your email address and we'll send you a code to reset your password.
            </p>
            <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" {...registerEmail('email')} />
                {emailErrors.email && (
                  <p className="text-sm text-destructive">{emailErrors.email.message}</p>
                )}
              </div>
              <div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Reset Code
                </Button>
              </div>
            </form>
            <div className="text-center">
              <Link href="/login" className="text-sm text-primary hover:underline">
                <ArrowLeft className="inline mr-1 h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => {
                resetOtp(); // Clear OTP field when going back
                setStep('email');
              }}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Enter Verification Code</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a 6-digit code to your email address. Please enter it below.
              </p>
            </div>

            <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP Code</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  {...registerOtp('otp')}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
                {otpErrors.otp && (
                  <p className="text-sm text-destructive">{otpErrors.otp.message}</p>
                )}
              </div>

              <div className="space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify Code
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="text-sm"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resending...
                      </>
                    ) : (
                      'Resend OTP'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}

        {step === 'password' && (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => setStep('otp')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Set New Password</h3>
              <p className="text-sm text-muted-foreground">
                Please enter your new password below.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...registerPassword('password')}
                  onChange={(e) => {
                    registerPassword('password').onChange(e);
                    setPasswordValue(e.target.value);
                  }}
                />
                {passwordErrors.password && (
                  <p className="text-sm text-destructive">{passwordErrors.password.message}</p>
                )}
                {passwordValue && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            level <= passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password strength: {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                    </p>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p className="font-semibold">Password must contain:</p>
                      <p className={passwordValue.length >= 8 ? 'text-green-600' : ''}>
                        {passwordValue.length >= 8 ? '✓' : '○'} At least 8 characters
                      </p>
                      <p className={/[a-z]/.test(passwordValue) ? 'text-green-600' : ''}>
                        {/[a-z]/.test(passwordValue) ? '✓' : '○'} One lowercase letter
                      </p>
                      <p className={/[A-Z]/.test(passwordValue) ? 'text-green-600' : ''}>
                        {/[A-Z]/.test(passwordValue) ? '✓' : '○'} One uppercase letter
                      </p>
                      <p className={/[0-9]/.test(passwordValue) ? 'text-green-600' : ''}>
                        {/[0-9]/.test(passwordValue) ? '✓' : '○'} One number
                      </p>
                      <p className={/[^a-zA-Z0-9]/.test(passwordValue) ? 'text-green-600' : ''}>
                        {/[^a-zA-Z0-9]/.test(passwordValue) ? '✓' : '○'} One special character (!@#$%^&*)
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...registerPassword('confirmPassword')}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>
              <div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reset Password
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

