"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Users, UserCircle, MessageSquare, LayoutDashboard, Menu, Bell } from "lucide-react"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut, useSession } from "next-auth/react"
import { ThemeToggle } from "@/components/theme-toggle"

// Define base routes without Admin
const baseRoutes = [
  {
    label: "Home",
    href: "/",
    icon: null,
  },
  {
    label: "Team Matching",
    href: "/team-matching",
    icon: Users,
    badge: (count: number) => count > 0 ? count : null,
  },
  {
    label: "My Profile",
    href: "/profile",
    icon: UserCircle,
  },
]

// Admin route definition
const adminRoute = {
  label: "Admin",
  href: "/admin",
  icon: LayoutDashboard,
}

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<any[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(true)

  // Dynamically create routes based on user role
  const routes = [...baseRoutes]
  if (session?.user?.role === "admin") {
    routes.push(adminRoute)
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session?.user?.id) return

      try {
        setNotificationsLoading(true)
        // Fetch user invitations
        const response = await fetch(`/api/invitations?userId=${session.user.id}`)
        
        if (response.ok) {
          const data = await response.json()
          // Filter pending invitations where this user is the recipient
          const pendingInvitations = data.filter((inv: any) => 
            inv.status === "pending" && 
            (inv.recipient?._id === session.user.id || 
             inv.recipient === session.user.id ||
             inv.recipient?.id === session.user.id)
          )
          
          // Create notifications from invitations
          const notifs = pendingInvitations.map((inv: any) => ({
            id: inv._id,
            type: 'invitation',
            title: `${inv.sender?.name || 'Someone'} invited you to join ${inv.team?.name || 'a team'}`,
            timestamp: new Date(inv.createdAt),
            sender: inv.sender,
            data: inv
          }))
          
          setNotifications(notifs)
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setNotificationsLoading(false)
      }
    }

    fetchNotifications()
    
    // Set up polling for notifications
    const interval = setInterval(fetchNotifications, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval)
  }, [session?.user?.id])

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) return 'just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"
          : "bg-transparent",
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <div className="px-2">
                <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <span className="text-lg font-bold">C</span>
                    </div>
                    <span className="text-xl font-bold">CatsConnect</span>
                  </div>
                </Link>
              </div>
              <nav className="flex flex-col gap-4 px-2 pt-8">
                {routes.map((route) => {
                  const Icon = route.icon
                  const badgeCount = route.badge && notifications.length > 0 ? route.badge(notifications.length) : null
                  
                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        pathname === route.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="h-4 w-4" />}
                        {route.label}
                      </div>
                      {badgeCount && (
                        <Badge variant="secondary" className="ml-auto">
                          {badgeCount}
                        </Badge>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-lg font-bold">C</span>
              </div>
              <span className="text-xl font-bold">CatsConnect</span>
            </div>
          </Link>
        </div>
        <nav className="hidden lg:flex lg:gap-1">
          {routes.map((route) => {
            const Icon = route.icon
            const isActive = pathname === route.href
            const badgeCount = route.badge && notifications.length > 0 ? route.badge(notifications.length) : null

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-300",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <div className="flex items-center gap-2">
                  {Icon && <Icon className={cn("h-4 w-4", isActive && "text-primary")} />}
                  {route.label}
                </div>
                {badgeCount && (
                  <Badge variant="primary" className="ml-auto">
                    {badgeCount}
                  </Badge>
                )}
                {isActive && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />}
              </Link>
            )
          })}
        </nav>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {notifications.length}
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                {notificationsLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="flex cursor-pointer flex-col items-start gap-1 p-3">
                      <div className="flex w-full items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={notification.sender?.image} alt={notification.sender?.name} />
                          <AvatarFallback>{notification.sender?.name?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{formatRelativeTime(new Date(notification.timestamp))}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                asChild
                className="cursor-pointer justify-center text-center text-sm font-medium text-primary"
              >
                <Link href="/team-matching?tab=invites">View all invitations</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
                    <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/team-matching">Team Matches</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/auth/signin">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

