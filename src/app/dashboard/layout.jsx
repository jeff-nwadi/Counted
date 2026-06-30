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
import { supabase } from '@/lib/supabase'

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
  const { session, loading } = useRequireUser()
  useInactivityTimer(session)
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    // Hard navigate so server components re-read the now-empty session
    // and the auth pages don't briefly try to render in the wrong layout.
    window.location.href = '/login'
  }

  // While the session probe is in flight, render an empty shell — the
  // SidebarProvider still needs to wrap everything, and the redirect to
  // /login (if needed) will happen a moment later.
  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-background">
        <div className="size-6 rounded-full border-2 border-border border-t-brand animate-spin" />
      </div>
    )
  }

  if (!session) {
    // The useRequireUser effect is redirecting — render nothing to avoid
    // flashing the dashboard at a signed-out user.
    return null
  }

  const email = session.user.email ?? ''
  const displayName =
    session.user.user_metadata?.full_name || email.split('@')[0]

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

            {/* Sub-group showing the three real data streams, as a visual
                anchor for the eventual data loading. Disabled (aria-disabled,
                not a real Link) until those routes exist. */}
            <SidebarGroup>
              <SidebarGroupLabel>Coming up</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          aria-disabled="true"
                          className="opacity-60 cursor-not-allowed"
                        >
                          <span>Reorder suggestions</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          aria-disabled="true"
                          className="opacity-60 cursor-not-allowed"
                        >
                          <span>Stock CSV import</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          aria-disabled="true"
                          className="opacity-60 cursor-not-allowed"
                        >
                          <span>Add a location</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
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
