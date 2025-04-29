'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import * as React from 'react';
import { register } from '../../services/api/auth.api';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'form'>) {
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    retypePassword: '',
  });
  const [errors, setErrors] = React.useState({
    password: '',
    retypePassword: '',
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleRegister = React.useCallback(async () => {
    try {
      await register(formData.email, formData.password);
      toast('Registration successful! Please login to continue!');
      if (searchParams.get('eventRegister')) {
        router.push(
          '/login?eventRegister=' + searchParams.get('eventRegister'),
        );
      } else {
        router.push('/login');
      }
    } catch (err) {
      toast('Registration failed: ' + err);
    }
  }, [formData.email, formData.password, router, searchParams]);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [event.target.name]: event.target.value,
      });
      setErrors({
        password: '',
        retypePassword:
          event.target.name === 'retypePassword'
            ? event.target.value !== formData.password
              ? 'Your retyped password does not match!'
              : ''
            : '',
      });
    },
    [formData],
  );

  return (
    <form className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Register your new account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your account details below to register
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="m@example.com"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input
            id="password"
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="re-password">Retype Your Password</Label>
          </div>
          <Input
            id="re-password"
            type="password"
            name="retypePassword"
            required
            value={formData.retypePassword}
            onChange={handleChange}
          />
          {errors.retypePassword ? (
            <p className="text-red-500 text-sm mt-1">{errors.retypePassword}</p>
          ) : (
            <p className="text-red-500 text-sm mt-1 h-5"></p>
          )}
        </div>
        <Button
          className="w-full"
          type="button"
          onClick={handleRegister}
          disabled={
            errors.retypePassword !== '' ||
            formData.email === '' ||
            formData.password === '' ||
            formData.retypePassword === ''
          }
        >
          Register
        </Button>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Already having an account?
          </span>
        </div>
        <Button
          variant="outline"
          className="w-full"
          type="button"
          onClick={() => {
            if (searchParams.get('eventRegister')) {
              router.push(
                '/login?eventRegister=' + searchParams.get('eventRegister'),
              );
            } else {
              router.push('/login');
            }
          }}
        >
          Login
        </Button>
      </div>
    </form>
  );
}
