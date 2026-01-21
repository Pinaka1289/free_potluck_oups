'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ChefHat, ArrowLeft, Loader2 } from 'lucide-react'
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
  
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  })

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      } else {
        setCheckingAuth(false)
      }
    }
    checkUser()
  }, [router, supabase.auth])

  // Check for mode in URL params
  useEffect(() => {
    const modeParam = searchParams.get('mode')
    if (modeParam === 'signup') {
      setMode('signup')
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
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
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
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">
            {mode === 'signin' ? 'Welcome Back!' : 'Join PotluckParty'}
          </h1>
          <p className="mt-3 text-[rgb(var(--muted-foreground))]">
            {mode === 'signin' 
              ? 'Sign in to manage your events' 
              : 'Create an account to save and manage your events'}
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
              {/* Mode Toggle */}
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

                <Input
                  id="password"
                  name="password"
                  type="password"
                  label="Password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  icon={<Lock className="h-5 w-5" />}
                  required
                />

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
              </form>

              <p className="mt-6 text-center text-sm text-[rgb(var(--muted-foreground))]">
                {mode === 'signin' ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <button
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
                      onClick={() => setMode('signin')}
                      className="font-medium text-[rgb(var(--primary))] hover:underline"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
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
