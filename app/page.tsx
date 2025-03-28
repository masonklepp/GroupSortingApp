"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, UserCircle, MessageSquare, LayoutDashboard, ChevronRight, ArrowRight } from "lucide-react"
import { FeatureCard } from "@/components/feature-card"
import { AnimatedGradientText } from "@/components/animated-gradient-text"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://docs.gato.txst.edu/21069/w/2000/xjcXYBNZRulv/old-main-sunset.jpg')] bg-cover bg-center bg-no-repeat brightness-[0.15]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />

        <div className="relative mx-auto flex min-h-[90vh] max-w-screen-xl flex-col items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
          <div className={`transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0 translate-y-10"}`}>
            <Badge variant="outline" className="mb-4 border-primary/50 px-4 py-1 text-sm backdrop-blur">
              <span className="mr-1 text-primary">✓</span> Trusted by 2000+ students
            </Badge>

            <h1 className="text-center text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find Your <AnimatedGradientText text="Perfect Team" />
            </h1>
            <p className="mt-6 max-w-lg text-center text-xl text-gray-300">
              Connect with like-minded students, collaborate effectively, and succeed together on your academic
              projects.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button size="lg" className="gap-2 rounded-full" asChild>
                <Link href="/team-matching">
                  Find Teammates
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full" asChild>
                <Link href="/profile">Create Profile</Link>
              </Button>
            </div>
          </div>

          <div className="absolute -bottom-10 left-0 right-0 mx-auto h-20 w-full max-w-4xl rounded-t-3xl bg-background" />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-background py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4 border-primary/50 px-4 py-1 text-sm">
              <span className="mr-1 text-primary">★</span> Smart Matching
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How CatsConnect Works</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Our platform makes team formation simple, efficient, and stress-free with AI-powered matching.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={UserCircle}
              title="Create Your Profile"
              description="Share your skills, working style, and availability to find the perfect match."
              href="/profile"
              buttonText="Get Started"
              className="animate-slide-up"
              style={{ animationDelay: "0ms" }}
            />
            <FeatureCard
              icon={Users}
              title="Find Matches"
              description="Get matched with compatible teammates based on your preferences and skills."
              href="/team-matching"
              buttonText="View Matches"
              className="animate-slide-up"
              style={{ animationDelay: "100ms" }}
            />
            <FeatureCard
              icon={MessageSquare}
              title="Connect & Invite"
              description="Send invitations and communicate with potential teammates seamlessly."
              href="/invitations"
              buttonText="Manage Invitations"
              className="animate-slide-up"
              style={{ animationDelay: "200ms" }}
            />
            <FeatureCard
              icon={LayoutDashboard}
              title="Manage Teams"
              description="For instructors: Oversee team formation and track progress with detailed analytics."
              href="/admin"
              buttonText="Admin Dashboard"
              className="animate-slide-up"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="grid-pattern py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4 border-primary/50 px-4 py-1 text-sm">
              <span className="mr-1 text-primary">⚙️</span> The Process
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Intelligent Team Formation</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Our advanced algorithm considers multiple factors to create balanced and effective teams.
            </p>
          </div>

          <div className="mt-16">
            <div className="relative">
              <div className="absolute left-1/2 h-full w-1 -translate-x-1/2 bg-border" />

              <div className="relative mb-12 ml-auto w-full pl-8 md:w-1/2">
                <div className="absolute -left-3 top-5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  1
                </div>
                <Card className="gradient-border overflow-hidden">
                  <CardContent className="p-6">
                    <h3 className="mb-2 text-xl font-bold">Profile Analysis</h3>
                    <p className="text-muted-foreground">
                      Our system analyzes your skills, preferences, and working style to create a comprehensive profile.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="relative mb-12 mr-auto w-full pr-8 md:w-1/2">
                <div className="absolute -right-3 top-5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  2
                </div>
                <Card className="gradient-border overflow-hidden">
                  <CardContent className="p-6">
                    <h3 className="mb-2 text-xl font-bold">Compatibility Matching</h3>
                    <p className="text-muted-foreground">
                      We match you with students who complement your skills and share similar availability patterns.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="relative mb-12 ml-auto w-full pl-8 md:w-1/2">
                <div className="absolute -left-3 top-5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  3
                </div>
                <Card className="gradient-border overflow-hidden">
                  <CardContent className="p-6">
                    <h3 className="mb-2 text-xl font-bold">Team Formation</h3>
                    <p className="text-muted-foreground">
                      Create or join teams with your matches, ensuring balanced skill distribution and role coverage.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="relative mb-12 mr-auto w-full pr-8 md:w-1/2">
                <div className="absolute -right-3 top-5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  4
                </div>
                <Card className="gradient-border overflow-hidden">
                  <CardContent className="p-6">
                    <h3 className="mb-2 text-xl font-bold">Collaboration Tools</h3>
                    <p className="text-muted-foreground">
                      Access integrated tools for scheduling, communication, and project management with your team.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="hero-pattern py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4 border-primary/50 px-4 py-1 text-sm backdrop-blur">
              <span className="mr-1 text-primary">💬</span> Testimonials
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Student Success Stories</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Hear from students who found their perfect teams through CatsConnect.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="card-hover-effect glassmorphism">
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#FFD700"
                        stroke="#FFD700"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "CatsConnect helped me find teammates who share my work ethic and schedule. Our project earned an A+
                  because we worked so well together!"
                </p>
                <div className="mt-6 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary" />
                  <div className="ml-3">
                    <p className="font-medium">Sarah J.</p>
                    <p className="text-sm text-muted-foreground">Computer Science</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover-effect glassmorphism">
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#FFD700"
                        stroke="#FFD700"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "As someone with social anxiety, finding project partners used to be stressful. This platform made it
                  easy to connect with compatible classmates."
                </p>
                <div className="mt-6 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary" />
                  <div className="ml-3">
                    <p className="font-medium">Michael T.</p>
                    <p className="text-sm text-muted-foreground">Business Administration</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover-effect glassmorphism">
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#FFD700"
                        stroke="#FFD700"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "The matching algorithm is spot-on! I found teammates with complementary skills that perfectly
                  balanced our group dynamic."
                </p>
                <div className="mt-6 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary" />
                  <div className="ml-3">
                    <p className="font-medium">Emily R.</p>
                    <p className="text-sm text-muted-foreground">Graphic Design</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-violet-400/20" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl rounded-2xl bg-card p-8 shadow-lg sm:p-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to find your perfect team?</h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Create your profile today and start connecting with compatible teammates.
              </p>
              <Button size="lg" className="mt-8 gap-2 rounded-full px-8 bg-primary hover:bg-primary/90" asChild>
                <Link href="/profile">
                  Get Started Now
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

