"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, Loader2, AlertCircle, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const roles = [
  { value: "Developer", label: "Developer" },
  { value: "Designer", label: "Designer" },
  { value: "Leader", label: "Leader" },
  { value: "Researcher", label: "Researcher" },
  { value: "Collaborator", label: "Collaborator" },
]

const availabilityOptions = [
  { value: "Flexible", label: "Flexible" },
  { value: "Mornings", label: "Mornings" },
  { value: "Afternoons", label: "Afternoons" },
  { value: "Evenings", label: "Evenings" },
  { value: "Weekends", label: "Weekends" },
  { value: "Mornings, Afternoons", label: "Mornings & Afternoons" },
  { value: "Afternoons, Evenings", label: "Afternoons & Evenings" },
  { value: "Evenings, Weekends", label: "Evenings & Weekends" },
]

const communicationOptions = [
  { value: "No preference", label: "No preference" },
  { value: "Video calls", label: "Video calls" },
  { value: "Chat and messages", label: "Chat and messages" },
  { value: "Email and documents", label: "Email and documents" },
  { value: "In-person meetings", label: "In-person meetings" },
]

const teamSizeOptions = [
  { value: "Any", label: "Any size" },
  { value: "2-3 people", label: "Small (2-3 people)" },
  { value: "3-5 people", label: "Medium (3-5 people)" },
  { value: "5-10 people", label: "Large (5-10 people)" },
  { value: "10+ people", label: "Very large (10+ people)" },
]

const learningStyleOptions = [
  { value: "Any", label: "Any style" },
  { value: "Visual", label: "Visual" },
  { value: "Auditory", label: "Auditory" },
  { value: "Reading", label: "Reading/Writing" },
  { value: "Hands-on", label: "Hands-on/Kinesthetic" },
]

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState("basic")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    image: "",
    role: "",
    skills: [] as string[],
    skillsInput: "",
    availability: "Flexible",
    bio: "",
    workingStyle: {
      communication: "No preference",
      workHours: "Flexible",
      teamSize: "Any",
      learningStyle: "Any",
    },
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/profile")
    }
    
    if (status === "authenticated") {
      fetchUserProfile()
    }
  }, [status, router])

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/profile")
      
      if (!response.ok) {
        throw new Error("Failed to fetch profile")
      }
      
      const profileData = await response.json()
      profileData.skillsInput = profileData.skills.join(", ")
      setProfile(profileData)
    } catch (err) {
      console.error("Error fetching profile:", err)
      setError("Failed to load profile data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveProfile({
      name: profile.name,
      role: profile.role,
      bio: profile.bio,
      availability: profile.availability,
      skills: profile.skills,
    })
  }

  const handleWorkingStyleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveProfile({
      workingStyle: profile.workingStyle
    })
  }

  const saveProfile = async (updateData: any) => {
    setIsSaving(true)
    setError("")
    setSuccess(false)
    
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update profile")
      }
      
      setSuccess(true)
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name.includes(".")) {
      // Handle nested objects (workingStyle)
      const [parent, child] = name.split(".")
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }))
    } else {
      setProfile(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Store the raw input string instead of splitting immediately
    const rawInput = e.target.value
    
    // Update the skills array in the profile state
    setProfile(prev => ({
      ...prev,
      // We're only updating what's displayed in the input, but we'll convert to array when saving
      skillsInput: rawInput,
      // The actual skills array is derived from the input when needed
      skills: rawInput
        .split(",")
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0)
    }))
  }

  if (isLoading) {
    return (
      <div className="container max-w-3xl py-10 flex justify-center items-center min-h-[500px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and preferences to improve team matching</p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center mb-8 space-x-4">
          <Avatar className="h-20 w-20 border-2 border-primary/20">
            <AvatarImage src={profile.image} alt={profile.name} />
            <AvatarFallback>
              {profile.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{profile.name}</h2>
            <p className="text-muted-foreground">{profile.email}</p>
            <div className="flex mt-2">
              <Badge variant="outline" className="mr-2">
                {profile.role}
              </Badge>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="preferences">Working Style</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic">
            <Card>
              <form onSubmit={handleBasicInfoSubmit}>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Update your basic profile information and skills
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email (cannot be changed)</Label>
                      <Input
                        id="email"
                        value={profile.email}
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={profile.role}
                        onValueChange={(value) => handleSelectChange("role", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="availability">Availability</Label>
                      <Select
                        value={profile.availability}
                        onValueChange={(value) => handleSelectChange("availability", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your availability" />
                        </SelectTrigger>
                        <SelectContent>
                          {availabilityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma separated)</Label>
                    <Input
                      id="skills"
                      value={profile.skillsInput || profile.skills.join(", ")}
                      onChange={handleSkillsChange}
                      placeholder="React, JavaScript, Design, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profile.bio}
                      onChange={handleChange}
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Basic Information
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card>
              <form onSubmit={handleWorkingStyleSubmit}>
                <CardHeader>
                  <CardTitle>Working Style</CardTitle>
                  <CardDescription>
                    Update your working preferences to improve team compatibility matching
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="communication">Preferred Communication</Label>
                      <Select
                        value={profile.workingStyle.communication}
                        onValueChange={(value) => handleSelectChange("workingStyle.communication", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your preference" />
                        </SelectTrigger>
                        <SelectContent>
                          {communicationOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="workHours">Working Hours</Label>
                      <Select
                        value={profile.workingStyle.workHours}
                        onValueChange={(value) => handleSelectChange("workingStyle.workHours", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your work hours" />
                        </SelectTrigger>
                        <SelectContent>
                          {availabilityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="teamSize">Preferred Team Size</Label>
                      <Select
                        value={profile.workingStyle.teamSize}
                        onValueChange={(value) => handleSelectChange("workingStyle.teamSize", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select team size" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamSizeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="learningStyle">Learning Style</Label>
                      <Select
                        value={profile.workingStyle.learningStyle}
                        onValueChange={(value) => handleSelectChange("workingStyle.learningStyle", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select learning style" />
                        </SelectTrigger>
                        <SelectContent>
                          {learningStyleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Working Style
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

