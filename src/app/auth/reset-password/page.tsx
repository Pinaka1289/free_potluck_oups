'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, KeyRound, ArrowLeft, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })

  // Check if user has a valid session from the reset link
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        showToast('Invalid or expired reset link. Please request a new one.', 'error')
        router.push('/auth?mode=forgot')
      }
    }
    checkSession()
  }, [router, supabase.auth, showToast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (error) throw error

      setSuccess(true)
      showToast('Password updated successfully!', 'success')
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password'
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen py-12">
        <div className="absolute inset-0 bg-pattern opacity-30" />
        <div className="relative mx-auto max-w-md px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card>
              <CardContent className="py-12">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-[rgb(var(--foreground))]">
                  Password Updated!
                </h2>
                <p className="mt-3 text-[rgb(var(--muted-foreground))]">
                  Your password has been successfully reset. Redirecting to dashboard...
                </p>
                <div className="mt-6">
                  <Loader2 className="h-6 w-6 animate-spin text-[rgb(var(--primary))] mx-auto" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
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
        {/* Back to Sign In */}
        <Link 
          href="/auth"
          className="inline-flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))]">
            <KeyRound className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Set New Password</h1>
          <p className="mt-3 text-[rgb(var(--muted-foreground))]">
            Enter your new password below
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    label="New Password"
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

                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm New Password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    icon={<Lock className="h-5 w-5" />}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[38px] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  Password must be at least 6 characters long
                </p>

                <Button type="submit" size="lg" loading={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
