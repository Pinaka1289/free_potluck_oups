'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ChefHat, ArrowLeft, Loader2, Eye, EyeOff, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const supabase = createClient()
  
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  })

  // Check for error in URL params
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      let errorMessage = 'Authentication failed'
      if (errorParam === 'auth_callback_error') {
        errorMessage = 'Failed to complete Google sign-in. Please try again.'
      } else if (errorParam === 'session_not_established') {
        errorMessage = 'Session not established. Please try signing in again.'
      } else if (errorParam === 'no_code') {
        errorMessage = 'Invalid authentication request. Please try again.'
      }
      showToast(errorMessage, 'error')
      // Clean up URL
      router.replace('/auth')
    }
  }, [searchParams, showToast, router])

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Auth check error:', error)
          setCheckingAuth(false)
          return
        }
        
        if (user) {
          // Small delay to ensure session is fully established
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Check for redirect URL
          const redirectUrl = searchParams.get('redirect')
          if (redirectUrl) {
            router.push(redirectUrl)
          } else {
            router.push('/dashboard')
          }
        } else {
          setCheckingAuth(false)
        }
      } catch (err) {
        console.error('User check error:', err)
        setCheckingAuth(false)
      }
    }
    checkUser()
  }, [router, supabase.auth, searchParams])

  // Check for mode in URL params
  useEffect(() => {
    const modeParam = searchParams.get('mode')
    if (modeParam === 'signup') {
      setMode('signup')
    } else if (modeParam === 'forgot') {
      setMode('forgot')
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName
            }
          }
        })

        if (error) throw error

        showToast('Account created! Please check your email to verify.', 'success')
        setMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })

        if (error) throw error

        showToast('Welcome back!', 'success')
        const redirectUrl = searchParams.get('redirect')
        router.push(redirectUrl || '/dashboard')
        router.refresh()
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email.trim()) {
      showToast('Please enter your email address', 'error')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      showToast('Password reset email sent! Check your inbox.', 'success')
      setMode('signin')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email'
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const redirectUrl = searchParams.get('redirect') || '/dashboard'
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectUrl)}`
        }
      })

      if (error) throw error
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Google sign-in failed'
      showToast(errorMessage, 'error')
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      {/* Background */}
      <div className="absolute inset-0 bg-pattern opacity-30" />
      <div className="absolute -left-64 top-0 h-[500px] w-[500px] rounded-full bg-[rgb(var(--primary))]/5 blur-3xl" />
      <div className="absolute -right-64 bottom-0 h-[500px] w-[500px] rounded-full bg-[rgb(var(--accent))]/5 blur-3xl" />

      <div className="relative mx-auto max-w-md px-4 sm:px-6">
        {/* Back to Home */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))]">
            {mode === 'forgot' ? (
              <KeyRound className="h-8 w-8 text-white" />
            ) : (
              <ChefHat className="h-8 w-8 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold">
            {mode === 'signin' && 'Welcome Back!'}
            {mode === 'signup' && 'Join PotluckPartys'}
            {mode === 'forgot' && 'Reset Password'}
          </h1>
          <p className="mt-3 text-[rgb(var(--muted-foreground))]">
            {mode === 'signin' && 'Sign in to manage your events'}
            {mode === 'signup' && 'Create an account to save and manage your events'}
            {mode === 'forgot' && 'Enter your email and we\'ll send you a reset link'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8"
        >
          <Card>
            <CardContent>
              {/* Mode Toggle - Only show for signin/signup */}
              {mode !== 'forgot' && (
                <div className="mb-6 flex rounded-xl bg-[rgb(var(--secondary))] p-1">
                  <button
                    onClick={() => setMode('signin')}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                      mode === 'signin'
                        ? 'bg-[rgb(var(--card))] text-[rgb(var(--foreground))] shadow-sm'
                        : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setMode('signup')}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                      mode === 'signup'
                        ? 'bg-[rgb(var(--card))] text-[rgb(var(--foreground))] shadow-sm'
                        : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Forgot Password Form */}
              {mode === 'forgot' ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    icon={<Mail className="h-5 w-5" />}
                    required
                  />

                  <Button type="submit" size="lg" loading={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>

                  <p className="text-center text-sm text-[rgb(var(--muted-foreground))]">
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="font-medium text-[rgb(var(--primary))] hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              ) : (
                /* Sign In / Sign Up Form */
                <>
                  {/* Google Sign In */}
                  <button
                    onClick={handleGoogleSignIn}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-3 text-sm font-medium text-[rgb(var(--foreground))] transition-all hover:bg-[rgb(var(--secondary))] hover:shadow-md"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[rgb(var(--border))]" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[rgb(var(--card))] px-2 text-[rgb(var(--muted-foreground))]">
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'signup' && (
                    <Input
                      id="fullName"
                      name="fullName"
                      label="Full Name"
                      placeholder="Enter your name"
                      value={formData.fullName}
                      onChange={handleChange}
                      icon={<User className="h-5 w-5" />}
                    />
                  )}

                  <Input
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    icon={<Mail className="h-5 w-5" />}
                    required
                  />

                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      label="Password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      icon={<Lock className="h-5 w-5" />}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[38px] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Forgot Password Link - Only show on sign in */}
                  {mode === 'signin' && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-sm text-[rgb(var(--primary))] hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <Button type="submit" size="lg" loading={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                      </>
                    ) : (
                      mode === 'signin' ? 'Sign In' : 'Create Account'
                    )}
                  </Button>

                    <p className="text-center text-sm text-[rgb(var(--muted-foreground))]">
                      {mode === 'signin' ? (
                        <>
                          Don&apos;t have an account?{' '}
                          <button
                            type="button"
                            onClick={() => setMode('signup')}
                            className="font-medium text-[rgb(var(--primary))] hover:underline"
                          >
                            Sign up
                          </button>
                        </>
                      ) : (
                        <>
                          Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() => setMode('signin')}
                            className="font-medium text-[rgb(var(--primary))] hover:underline"
                          >
                            Sign in
                          </button>
                        </>
                      )}
                    </p>
                  </form>
                </>
              )}
            </CardContent>
          </Card>

          {/* Info */}
          <p className="mt-6 text-center text-xs text-[rgb(var(--muted-foreground))]">
            By signing up, you agree to our Terms of Service and Privacy Policy.
            <br />
            Creating an account lets you manage all your potluck events in one place.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
