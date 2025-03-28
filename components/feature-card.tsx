import type { LucideIcon } from "lucide-react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  href: string
  buttonText: string
  className?: string
}

export function FeatureCard({ icon: Icon, title, description, href, buttonText, className = "" }: FeatureCardProps) {
  return (
    <Card className={`card-hover-effect overflow-hidden ${className}`}>
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10" />
      <CardHeader>
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="mt-2">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button variant="ghost" className="w-full group" asChild>
          <Link href={href} className="flex items-center justify-center">
            {buttonText}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

