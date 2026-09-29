import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/auth'
import type { Metadata } from 'next'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

import { OnboardingGuard } from '@/components/onboarding-guard'

export const metadata: Metadata = {
  title: 'Dashboard — JobBuddy AI',
  description: 'Your JobBuddy AI dashboard',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Extra server-side guard — proxy.ts is the first line of defense
  if (!user) {
    redirect('/login')
  }

  // Check if profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  const hasProfile = !!profile

  const displayName =
    user.user_metadata?.full_name ??
    user.email?.split('@')[0] ??
    'User'

  const avatarInitial = displayName.charAt(0).toUpperCase()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#09090f] text-white">
        {/* Top nav */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/5 bg-[#09090f]/85 backdrop-blur-md px-4 sticky top-0 z-50">
          <SidebarTrigger className="text-white/70 hover:text-white" />
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div 
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white shadow-sm ring-2 ring-indigo-500/30 cursor-default select-none" 
              title={displayName}
              aria-label={`Signed in as ${displayName}`}
            >
              {avatarInitial}
            </div>
            <form action={signOut}>
              <button id="logout-btn" type="submit" className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/60 transition-all hover:border-red-500/25 hover:bg-red-500/10 hover:text-red-400">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Sign out
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
          <OnboardingGuard hasProfile={hasProfile}>
            {children}
          </OnboardingGuard>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
