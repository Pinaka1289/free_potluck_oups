'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Shield,
  Users,
  Search,
  X,
  Infinity,
  RefreshCw,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { AI_QUOTA_LIMIT } from '@/lib/utils'
import type { User as SupabaseUser } from '@supabase/supabase-js'

type QuotaOverride = {
  quota_limit: number | null
  is_unlimited: boolean
  granted_by: string | null
  granted_at: string
  expires_at: string | null
  notes: string | null
}

type UserQuotaInfo = {
  user_id: string
  email: string
  full_name: string | null
  is_admin: boolean
  quota_override: QuotaOverride | null
  current_usage: number
  effective_quota: number | null
  remaining: number | null
}

export default function AdminPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const supabase = createClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [users, setUsers] = useState<UserQuotaInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [searchEmail, setSearchEmail] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserQuotaInfo | null>(null)
  const [showGrantModal, setShowGrantModal] = useState(false)
  const [grantForm, setGrantForm] = useState({
    quotaLimit: '',
    isUnlimited: false,
    expiresAt: '',
    notes: '',
  })

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/admin/users-quota?limit=100${searchEmail ? `&search=${encodeURIComponent(searchEmail)}` : ''}`
      )
      const json = await res.json()
      if (!res.ok) {
        showToast(json.error || 'Failed to fetch users', 'error')
        setUsers([])
        return
      }
      setUsers(json.users || [])
    } catch (err) {
      console.error('Fetch users error:', err)
      showToast('Failed to fetch users', 'error')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [searchEmail, showToast])

  useEffect(() => {
    let mounted = true
    
    const checkAuth = async () => {
      try {
        const { data: { user: u }, error: authError } = await supabase.auth.getUser()
        
        if (!mounted) return
        
        if (authError || !u) {
          router.push('/auth?redirect=/admin')
          return
        }
        
        setUser(u)

        const { data: profile, error: profileError } = await supabase
          .from('potluckpartys_profiles')
          .select('is_admin')
          .eq('id', u.id)
          .single()

        if (!mounted) return

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          showToast('Failed to load profile. Please try again.', 'error')
          setCheckingAuth(false)
          return
        }

        if (!profile || (profile as { is_admin?: boolean }).is_admin !== true) {
          showToast('Admin access required. Contact an administrator.', 'error')
          setCheckingAuth(false)
          setIsAdminUser(false)
          return
        }

        setIsAdminUser(true)
        setCheckingAuth(false)
        // Fetch users after auth check
        await fetchUsers()
      } catch (err) {
        console.error('Auth check error:', err)
        if (mounted) {
          showToast('Failed to verify admin access', 'error')
          setCheckingAuth(false)
        }
      }
    }
    
    checkAuth()
    
    return () => {
      mounted = false
    }
  }, [router, supabase, showToast, fetchUsers])

  useEffect(() => {
    if (isAdminUser && !checkingAuth) {
      fetchUsers()
    }
  }, [searchEmail, isAdminUser, checkingAuth, fetchUsers])

  const handleGrantQuota = async () => {
    if (!selectedUser) return

    setLoading(true)
    try {
      const res = await fetch('/api/admin/grant-quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.user_id,
          quotaLimit: grantForm.isUnlimited ? null : parseInt(grantForm.quotaLimit) || null,
          isUnlimited: grantForm.isUnlimited,
          expiresAt: grantForm.expiresAt || null,
          notes: grantForm.notes || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        showToast(json.error || 'Failed to grant quota', 'error')
        return
      }
      showToast('Quota granted successfully', 'success')
      setShowGrantModal(false)
      setSelectedUser(null)
      setGrantForm({ quotaLimit: '', isUnlimited: false, expiresAt: '', notes: '' })
      fetchUsers()
    } catch (err) {
      console.error('Grant quota error:', err)
      showToast('Failed to grant quota', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeQuota = async (userId: string) => {
    if (!confirm('Remove quota override? User will revert to default quota.')) return

    setLoading(true)
    try {
      const res = await fetch('/api/admin/revoke-quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const json = await res.json()
      if (!res.ok) {
        showToast(json.error || 'Failed to revoke quota', 'error')
        return
      }
      showToast('Quota override removed', 'success')
      fetchUsers()
    } catch (err) {
      console.error('Revoke quota error:', err)
      showToast('Failed to revoke quota', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--primary))] mx-auto mb-4" />
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Checking admin access...</p>
        </div>
      </main>
    )
  }

  if (!isAdminUser) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-2">Access Denied</h1>
          <p className="text-[rgb(var(--muted-foreground))] mb-4">
            You need admin privileges to access this page.
          </p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <header className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold text-[rgb(var(--foreground))]">
                <Shield className="h-8 w-8 text-[rgb(var(--primary))]" />
                Admin Panel
              </h1>
              <p className="mt-2 text-[rgb(var(--muted-foreground))]">
                Manage AI quota for users. Default quota: <strong>{AI_QUOTA_LIMIT} prompts/month</strong>
              </p>
            </div>
          </header>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Quota Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--muted-foreground))]" />
                  <Input
                    type="text"
                    placeholder="Search by email..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={fetchUsers}
                  disabled={loading}
                  icon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
                >
                  Refresh
                </Button>
              </div>

              {loading && users.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-[rgb(var(--primary))]" />
                </div>
              ) : users.length === 0 ? (
                <p className="py-8 text-center text-[rgb(var(--muted-foreground))]">No users found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-[rgb(var(--border))]">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-[rgb(var(--foreground))]">
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-[rgb(var(--foreground))]">
                          Usage
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-[rgb(var(--foreground))]">
                          Quota
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-[rgb(var(--foreground))]">
                          Override
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-[rgb(var(--foreground))]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr
                          key={u.user_id}
                          className="border-b border-[rgb(var(--border))]/50 transition-colors hover:bg-[rgb(var(--secondary))]/20"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-[rgb(var(--foreground))]">
                                {u.full_name || 'No name'}
                              </div>
                              <div className="text-xs text-[rgb(var(--muted-foreground))]">{u.email}</div>
                              {u.is_admin && (
                                <span className="mt-1 inline-block rounded-full bg-[rgb(var(--primary))]/20 px-2 py-0.5 text-[10px] font-medium text-[rgb(var(--primary))]">
                                  Admin
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-[rgb(var(--foreground))]">
                            {u.current_usage} used
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {u.effective_quota === null ? (
                              <span className="inline-flex items-center gap-1 font-medium text-purple-600 dark:text-purple-400">
                                <Infinity className="h-4 w-4" />
                                Unlimited
                              </span>
                            ) : (
                              <span className="text-[rgb(var(--foreground))]">
                                {u.remaining !== null ? (
                                  <span className={u.remaining === 0 ? 'text-red-500' : 'text-green-500'}>
                                    {u.remaining} / {u.effective_quota}
                                  </span>
                                ) : (
                                  `${u.effective_quota}`
                                )}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-[rgb(var(--muted-foreground))]">
                            {u.quota_override ? (
                              <div>
                                {u.quota_override.is_unlimited ? (
                                  <span className="text-purple-600 dark:text-purple-400">Unlimited</span>
                                ) : (
                                  <span>Limit: {u.quota_override.quota_limit}</span>
                                )}
                                {u.quota_override.expires_at && (
                                  <div className="mt-1">
                                    Expires: {new Date(u.quota_override.expires_at).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[rgb(var(--muted-foreground))]">Default</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(u)
                                  setGrantForm({
                                    quotaLimit: u.quota_override?.quota_limit?.toString() || '',
                                    isUnlimited: u.quota_override?.is_unlimited || false,
                                    expiresAt: u.quota_override?.expires_at
                                      ? new Date(u.quota_override.expires_at).toISOString().split('T')[0]
                                      : '',
                                    notes: u.quota_override?.notes || '',
                                  })
                                  setShowGrantModal(true)
                                }}
                              >
                                {u.quota_override ? 'Edit' : 'Grant'}
                              </Button>
                              {u.quota_override && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRevokeQuota(u.user_id)}
                                  disabled={loading}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Grant Quota Modal */}
      {showGrantModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
                Grant Quota Override
              </h2>
              <button
                onClick={() => {
                  setShowGrantModal(false)
                  setSelectedUser(null)
                }}
                className="rounded-lg p-1 text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--secondary))]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 text-sm text-[rgb(var(--muted-foreground))]">
              User: <strong className="text-[rgb(var(--foreground))]">{selectedUser.email}</strong>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={grantForm.isUnlimited}
                  onChange={(e) => {
                    setGrantForm({ ...grantForm, isUnlimited: e.target.checked, quotaLimit: '' })
                  }}
                  className="h-4 w-4 rounded border-[rgb(var(--border))]"
                />
                <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                  Unlimited prompts
                </span>
              </label>

              {!grantForm.isUnlimited && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-[rgb(var(--foreground))]">
                    Custom Quota Limit
                  </label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g., 100"
                    value={grantForm.quotaLimit}
                    onChange={(e) => setGrantForm({ ...grantForm, quotaLimit: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
                    Leave empty to remove override (revert to default: {AI_QUOTA_LIMIT})
                  </p>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-[rgb(var(--foreground))]">
                  Expires At (optional)
                </label>
                <Input
                  type="date"
                  value={grantForm.expiresAt}
                  onChange={(e) => setGrantForm({ ...grantForm, expiresAt: e.target.value })}
                />
                <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
                  Leave empty for permanent override
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[rgb(var(--foreground))]">
                  Notes (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Reason for override..."
                  value={grantForm.notes}
                  onChange={(e) => setGrantForm({ ...grantForm, notes: e.target.value })}
                  className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--primary))] focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowGrantModal(false)
                    setSelectedUser(null)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGrantQuota}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  )
}
