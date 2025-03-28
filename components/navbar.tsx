"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import { Users, UserCircle, MessageSquare, LayoutDashboard, Menu, Bell } from "lucide-react"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const routes = [
  {
    label: "Home",
    href: "/",
    icon: null,
  },
  {
    label: "Team Matching",
    href: "/team-matching",
    icon: Users,
  },
  {
    label: "My Profile",
    href: "/profile",
    icon: UserCircle,
  },
  {
    label: "Invitations",
    href: "/invitations",
    icon: MessageSquare,
    badge: 3,
  },
  {
    label: "Admin",
    href: "/admin",
    icon: LayoutDashboard,
  },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
                      {route.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {route.badge}
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
                {route.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {route.badge}
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
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  3
                </span>
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                <DropdownMenuItem className="flex cursor-pointer flex-col items-start gap-1 p-3">
                  <div className="flex w-full items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Jane Doe invited you to join Project Alpha</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex cursor-pointer flex-col items-start gap-1 p-3">
                  <div className="flex w-full items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">John Smith accepted your invitation</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex cursor-pointer flex-col items-start gap-1 p-3">
                  <div className="flex w-full items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>AC</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New match found: Alice Cooper (95% compatibility)</p>
                      <p className="text-xs text-muted-foreground">3 hours ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer justify-center text-center text-sm font-medium text-primary">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/profile" className="flex w-full">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/team-matching" className="flex w-full">
                  My Matches
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/invitations" className="flex w-full">
                  Invitations
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

