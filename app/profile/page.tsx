"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, UserCircle, Upload, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { AnimatedGradientText } from "@/components/animated-gradient-text"
import { Progress } from "@/components/ui/progress"

export default function ProfilePage() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [skills, setSkills] = useState<string[]>(["JavaScript", "React", "UI Design"])
  const [newSkill, setNewSkill] = useState("")
  const [profileCompletion, setProfileCompletion] = useState(65)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill])
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">
              My <AnimatedGradientText text="Profile" />
            </h1>
            <p className="text-muted-foreground">Complete your profile to improve your matches</p>
          </div>
          <Card className="w-full sm:w-auto">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Profile Completion</p>
                  <Progress value={profileCompletion} className="mt-2 h-2" />
                </div>
                <div className="text-2xl font-bold text-primary">{profileCompletion}%</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" onClick={() => setActiveTab("profile")}>
              Profile Information
            </TabsTrigger>
            <TabsTrigger value="preferences" onClick={() => setActiveTab("preferences")}>
              Preferences
            </TabsTrigger>
            <TabsTrigger value="availability" onClick={() => setActiveTab("availability")}>
              Availability
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="animate-slide-up space-y-6">
            <Card className="overflow-hidden">
              <div className="absolute right-0 top-0 h-32 w-32 bg-primary/10" />
              <CardHeader className="relative">
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and public profile.</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full bg-muted">
                    <UserCircle className="h-24 w-24 text-muted-foreground" />
                    <Button size="sm" className="absolute bottom-0 right-0 h-8 w-8 rounded-full p-0">
                      <Upload className="h-4 w-4" />
                      <span className="sr-only">Upload Image</span>
                    </Button>
                  </div>
                  <div className="space-y-4 sm:flex-1">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First name</Label>
                        <Input id="first-name" placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input id="last-name" placeholder="Doe" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john.doe@example.com" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="major">Major</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your major" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cs">Computer Science</SelectItem>
                      <SelectItem value="business">Business Administration</SelectItem>
                      <SelectItem value="design">Graphic Design</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell others about yourself, your interests, and your goals..."
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t bg-muted/10 px-6 py-4">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden">
              <div className="absolute right-0 top-0 h-32 w-32 bg-secondary/10" />
              <CardHeader className="relative">
                <CardTitle>Skills & Expertise</CardTitle>
                <CardDescription>Add skills that you bring to team projects.</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="skill-tag flex items-center gap-1 px-3 py-1.5">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="ml-1 rounded-full p-1 hover:bg-muted">
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {skill}</span>
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addSkill()
                      }
                    }}
                  />
                  <Button onClick={addSkill}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Previous Team Experience</Label>
                  <Textarea
                    id="experience"
                    placeholder="Describe your past experience in team projects..."
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t bg-muted/10 px-6 py-4">
                <Button variant="outline">Cancel</Button>
                <Button>Save Skills</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="animate-slide-up space-y-6">
            <Card className="overflow-hidden">
              <div className="absolute right-0 top-0 h-32 w-32 bg-accent/10" />
              <CardHeader className="relative">
                <CardTitle>Working Style</CardTitle>
                <CardDescription>Define how you prefer to work in team environments.</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>How committed are you to completing group tasks on time?</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Less Likely</span>
                      <Slider defaultValue={[75]} max={100} step={1} className="w-[60%]" />
                      <span className="text-sm text-muted-foreground">Highly Likely</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>How well do you handle stress in team environments?</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Less Well</span>
                      <Slider defaultValue={[60]} max={100} step={1} className="w-[60%]" />
                      <span className="text-sm text-muted-foreground">Very Well</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="communication">Preferred Communication Style</Label>
                  <Select defaultValue="chat">
                    <SelectTrigger>
                      <SelectValue placeholder="Select communication style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="chat">Chat (Discord, Slack, etc.)</SelectItem>
                      <SelectItem value="video">Video Calls</SelectItem>
                      <SelectItem value="inperson">In-Person Meetings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="learning-style">Preferred Learning Style</Label>
                  <Select defaultValue="visual">
                    <SelectTrigger>
                      <SelectValue placeholder="Select learning style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Visual</SelectItem>
                      <SelectItem value="auditory">Auditory</SelectItem>
                      <SelectItem value="kinesthetic">Hands-on</SelectItem>
                      <SelectItem value="reading">Reading/Writing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team-role">Preferred Team Role</Label>
                  <Select defaultValue="collaborator">
                    <SelectTrigger>
                      <SelectValue placeholder="Select preferred role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leader">Leader</SelectItem>
                      <SelectItem value="collaborator">Collaborator</SelectItem>
                      <SelectItem value="researcher">Researcher</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t bg-muted/10 px-6 py-4">
                <Button variant="outline">Cancel</Button>
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="availability" className="animate-slide-up space-y-6">
            <Card className="overflow-hidden">
              <div className="absolute right-0 top-0 h-32 w-32 bg-primary/10" />
              <CardHeader className="relative">
                <CardTitle>Schedule & Availability</CardTitle>
                <CardDescription>Set your availability for team meetings and collaboration.</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div className="space-y-2">
                  <Label>Weekly Availability (hours)</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">1 hour</span>
                    <Slider defaultValue={[10]} max={20} step={1} className="w-[60%]" />
                    <span className="text-sm text-muted-foreground">20+ hours</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Meeting Times</Label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center space-x-2">
                      <Switch id="morning" />
                      <Label htmlFor="morning">Morning (8am-12pm)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="afternoon" defaultChecked />
                      <Label htmlFor="afternoon">Afternoon (12pm-5pm)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="evening" defaultChecked />
                      <Label htmlFor="evening">Evening (5pm-10pm)</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Unavailable Dates</Label>
                  <div className="grid gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Select a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <Button variant="outline" className="w-full">
                      Add Date
                    </Button>
                  </div>

                  <div className="mt-4 rounded-md border p-4">
                    <div className="text-sm font-medium">Unavailable Dates:</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        March 15, 2025
                        <button className="ml-1 rounded-full p-1 hover:bg-muted">
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove date</span>
                        </button>
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        March 22-23, 2025
                        <button className="ml-1 rounded-full p-1 hover:bg-muted">
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove date</span>
                        </button>
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t bg-muted/10 px-6 py-4">
                <Button variant="outline">Cancel</Button>
                <Button>Save Availability</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

