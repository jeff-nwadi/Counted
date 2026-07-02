'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ToastProvider } from '@/components/Toast'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/animate-ui/components/radix/sidebar'
import {
  LayoutDashboard,
  Boxes,
  ArrowRightLeft,
  Smartphone,
  Settings,
  LogOut,
  ChevronsUpDown,
  Package,
} from 'lucide-react'
import { useRequireUser } from '@/hooks/use-user'
import { useInactivityTimer } from '@/hooks/use-inactivity-timer'
import OrgMissingDialog from '@/components/OrgMissingDialog'
import { signOut } from '@/lib/auth-client'
import { useToast } from '@/components/Toast'
import { useQueryClient } from '@tanstack/react-query'

// Nav items for the five planned screens, in PRD build order.
const NAV = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'Location ledger',
    href: '/dashboard/ledger',
    icon: Boxes,
  },
  {
    label: 'Transfers',
    href: '/dashboard/transfers',
    icon: ArrowRightLeft,
  },
  {
    label: 'Mobile (staff view)',
    href: '/dashboard/mobile',
    icon: Smartphone,
  },
  {
    label: 'Setup & import',
    href: '/dashboard/setup',
    icon: Settings,
  },
]

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
        <Package className="w-4 h-4 text-white" strokeWidth={2} />
      </div>
      <span className="font-sans font-semibold text-[17px] tracking-tight">
        Counted
      </span>
    </Link>
  )
}

function isActive(pathname, href, exact) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function DashboardLayout({ children }) {
  const { session, loading, orgId } = useRequireUser()
  useInactivityTimer(session)
  // Real-time updates are replaced by TanStack Query's 15s polling
  // inside useStockQuery.js (see POLL_INTERVAL_MS). One client per
  // tab, no per-org WebSocket subscription to manage.
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    // Bust every org-scoped query so the next user (or a re-sign-in
    // by the same user) starts from an empty cache.
    queryClient.removeQueries({ queryKey: ['stock'] })
    queryClient.removeQueries({ queryKey: ['transfers'] })
    queryClient.removeQueries({ queryKey: ['profile'] })
    // Show the success toast BEFORE the hard navigate — the login
    // page is on a separate layout that has its own ToastProvider,
    // so this one needs to fire first.
    toast.success('Signed out', 'Come back soon.')
    // Hard navigate so server components re-read the now-empty session
    // and the auth pages don't briefly try to render in the wrong layout.
    window.location.href = '/login'
  }

  // While the session probe is in flight, render an empty shell — the
  // SidebarProvider still needs to wrap everything, and the redirect to
  // /login (if needed) will happen a moment later. suppressHydrationWarning
  // is required so browser extensions (ColorZilla, Grammarly, etc.) that
  // inject attributes into the body/its descendants don't break the
  // client-side replacement of this spinner.
  //
  // role="status" + aria-live="polite" makes screen readers announce
  // the loading state without interrupting current speech. The
  // sr-only text is read aloud; the spinner is visual-only.
  if (loading) {
    return (
      <div
        className="min-h-svh flex items-center justify-center bg-background"
        suppressHydrationWarning
        role="status"
        aria-live="polite"
      >
        <div className="size-6 rounded-full border-2 border-border border-t-brand animate-spin" />
        <span className="sr-only">Loading dashboard…</span>
      </div>
    )
  }

  if (!session) {
    // The useRequireUser effect is redirecting — render nothing to avoid
    // flashing the dashboard at a signed-out user.
    return null
  }

  // When the user has a session but no org profile (e.g. the trigger
  // didn't fire or the profile was orphaned), block the dashboard.
  // M-4: the per-page OrgMissingDialog used to be modal only in name
  // — the dashboard was still fully interactive behind it. RLS would
  // block the writes, but the visual state implied "you can't do
  // anything." Now the dialog is the only thing rendered at this
  // branch, and the only path forward is sign-out.
  if (!orgId) {
    return (
      <OrgMissingDialog
        open={true}
        userId={session.user.id}
        onSignOut={async () => {
          await signOut()
          toast.info('Signed out', 'Try signing in again to refresh your profile.')
          window.location.href = '/login'
        }}
      />
    )
  }

  const email = session.user.email ?? ''
  // Better Auth stores the user's display name on `user.name`.
  const displayName = session.user.name || email.split('@')[0]

  return (
    <ToastProvider>
      <SidebarProvider defaultOpen={true}>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center justify-between gap-2 px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <div className="group-data-[collapsible=icon]:hidden">
                <Logo />
              </div>
              <div className="hidden group-data-[collapsible=icon]:flex">
                <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
              </div>
            </div>
          </SidebarHeader>

          <SidebarSeparator />

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Inventory</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV.map((item) => {
                    const Icon = item.icon
                    const active = isActive(pathname, item.href, item.exact)
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.label}
                        >
                          <Link href={item.href}>
                            <Icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  tooltip={`Signed in as ${displayName}`}
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <div className="size-7 rounded-md bg-brand/10 text-brand flex items-center justify-center text-xs font-semibold">
                    {displayName.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-medium">{displayName}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Sign out"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  aria-busy={signingOut || undefined}
                >
                  <LogOut />
                  <span>{signingOut ? 'Signing out…' : 'Sign out'}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-white shadow-[0_1px_0_rgba(0,0,0,0.02)] px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1" />
           
          </header>
          <div className="flex-1 p-6 sm:p-8">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </ToastProvider>
  )
}
