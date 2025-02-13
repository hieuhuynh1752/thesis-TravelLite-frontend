"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import * as React from "react";
import { register, login } from "../../services/api/auth.api";
import {useRouter} from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const router = useRouter()

  const handleRegister = React.useCallback(async () => {
    try {
      await register(email, password);
      alert("Registration successful!");
    } catch (err) {
      console.log("Registration failed: " + err);
    }
  },[email, password]);

  const handleLogin = React.useCallback(async () => {
    try {
      const response = await login(email, password);
      if(response.status === 201){
        document.cookie = `token=${response.data.access_token}; path=/;`
        document.cookie = `role=${response.data.user.role}; path=/`

        router.push('/dashboard')
      }
    } catch (err) {
      console.log("Login failed: " + err);
    }
  },[email, password, router])

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(event) => setEmail(event.target.value)}/>
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input id="password" type="password" required value={password} onChange={(event)=> setPassword(event.target.value)}/>
        </div>
        <Button type="button" className="w-full" onClick={handleLogin}>
          Login
        </Button>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <Button variant="outline" className="w-full" type="button" onClick={handleRegister}>
          Register
        </Button>
      </div>
    </form>
  )
}
