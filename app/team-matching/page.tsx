"use client"

import { Dialog } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Users, Search, Sliders, Info } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MatchCard } from "@/components/match-card"
import { Skeleton } from "@/components/ui/skeleton"
import { AnimatedGradientText } from "@/components/animated-gradient-text"
import { toast } from "@/components/ui/use-toast"
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const matchData = [
  {
    id: 1,
    name: "Jane Doe",
    compatibility: 92,
    skills: ["Leadership", "Project Management", "Communication"],
    role: "Leader",
    availability: "Afternoons, Evenings",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "John Smith",
    compatibility: 88,
    skills: ["Programming", "Research", "Problem Solving"],
    role: "Developer",
    availability: "Evenings, Weekends",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Sarah Johnson",
    compatibility: 85,
    skills: ["Communication", "Design", "Presentation"],
    role: "Collaborator",
    availability: "Mornings, Afternoons",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Michael Brown",
    compatibility: 81,
    skills: ["Research", "Data Analysis", "Writing"],
    role: "Researcher",
    availability: "Flexible",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Emily Davis",
    compatibility: 78,
    skills: ["Organization", "Time Management", "Documentation"],
    role: "Collaborator",
    availability: "Afternoons only",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function TeamMatchingPage() {
  const [activeTab, setActiveTab] = useState("matches")
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredMatches, setFilteredMatches] = useState(matchData)
  const [viewTeamDialog, setViewTeamDialog] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<any>(null)
  const [invitations, setInvitations] = useState([
    {
      id: 1,
      name: "Robert Davis",
      date: "March 10, 2025",
      status: "pending",
      avatar: "RD",
    },
    {
      id: 2,
      name: "Amanda Wilson",
      date: "March 8, 2025",
      status: "accepted",
      avatar: "AW",
    },
    {
      id: 3,
      name: "Thomas Jackson",
      date: "March 5, 2025",
      status: "declined",
      avatar: "TJ",
    },
  ])

  // Add these state variables after the other useState declarations
  const [createTeamDialog, setCreateTeamDialog] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamDescription, setNewTeamDescription] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: "Project Alpha",
      description: "Web Development Project",
      status: "Active",
      created: "March 1, 2025",
      members: [
        { name: "Jane Doe", role: "Team Lead", avatar: "JD" },
        { name: "John Smith", role: "Frontend Developer", avatar: "JS" },
        { name: "Amanda Wilson", role: "Backend Developer", avatar: "AW" },
        { name: "Michael Brown", role: "UI/UX Designer", avatar: "MB" },
        { name: "Sarah Johnson", role: "QA Tester", avatar: "SJ" },
      ],
      project: {
        deadline: "June 15, 2025",
        progress: "65%",
        nextMeeting: "March 20, 2025 at 3:00 PM",
      },
    },
    {
      id: 2,
      name: "Research Group B",
      description: "Data Analysis Project",
      status: "Active",
      created: "February 15, 2025",
      members: [
        { name: "Michael Brown", role: "Research Lead", avatar: "MB" },
        { name: "Sarah Johnson", role: "Data Analyst", avatar: "SJ" },
        { name: "Emily Davis", role: "Research Assistant", avatar: "ED" },
      ],
      project: {
        deadline: "May 30, 2025",
        progress: "42%",
        nextMeeting: "March 18, 2025 at 10:00 AM",
      },
    },
  ])

  // Add this function to handle team creation
  const handleCreateTeam = () => {
    if (!newTeamName) return

    const newTeam = {
      id: teams.length + 1,
      name: newTeamName,
      description: newTeamDescription || "New Project",
      status: "Active",
      created: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      members: [
        { name: "You", role: "Team Lead", avatar: "YO" },
        ...selectedMembers.map((member) => {
          const matchedUser = matchData.find((m) => m.name === member)
          return {
            name: member,
            role: matchedUser?.role || "Member",
            avatar: member
              .split(" ")
              .map((n) => n[0])
              .join(""),
          }
        }),
      ],
      project: {
        deadline: "Not set",
        progress: "0%",
        nextMeeting: "Not scheduled",
      },
    }

    setTeams([...teams, newTeam])
    setNewTeamName("")
    setNewTeamDescription("")
    setSelectedMembers([])
    setCreateTeamDialog(false)

    toast({
      title: "Team created",
      description: `${newTeamName} has been created successfully.`,
    })
  }

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (searchQuery) {
      setFilteredMatches(
        matchData.filter(
          (match) =>
            match.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            match.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
            match.role.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    } else {
      setFilteredMatches(matchData)
    }
  }, [searchQuery])

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">
              Team <AnimatedGradientText text="Matching" />
            </h1>
            <p className="text-muted-foreground">Find compatible teammates based on your profile</p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, skill, or role..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Sliders className="h-4 w-4" />
              <span className="sr-only">Filter</span>
            </Button>
            <Select defaultValue="compatibility">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by compatibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compatibility">Highest Compatibility</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="matches" className="gap-2">
              <Users className="h-4 w-4" />
              Matches
              <Badge variant="secondary" className="ml-1">
                {filteredMatches.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Sent Invites
              <Badge variant="secondary" className="ml-1">
                3
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="teams" className="gap-2">
              <Users className="h-4 w-4" />
              My Teams
              <Badge variant="secondary" className="ml-1">
                {teams.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="space-y-6">
            {loading ? (
              // Loading skeletons
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="flex-1 p-6">
                          <div className="flex items-center gap-4">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-40" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                            <div className="ml-auto">
                              <Skeleton className="h-14 w-14 rounded-full" />
                            </div>
                          </div>
                          <div className="mt-6">
                            <Skeleton className="mb-2 h-3 w-16" />
                            <div className="flex gap-2">
                              <Skeleton className="h-6 w-20 rounded-full" />
                              <Skeleton className="h-6 w-24 rounded-full" />
                              <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                          </div>
                          <div className="mt-4">
                            <Skeleton className="mb-2 h-3 w-20" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                        <div className="flex flex-row justify-end gap-2 border-t bg-muted/50 p-4 sm:flex-col sm:border-l sm:border-t-0">
                          <Skeleton className="h-9 w-24" />
                          <Skeleton className="h-9 w-24" />
                          <Skeleton className="h-9 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : filteredMatches.length > 0 ? (
              filteredMatches.map((match) => <MatchCard key={match.id} match={match} />)
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="rounded-full bg-muted p-3">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">No matches found</h3>
                  <p className="text-center text-muted-foreground">
                    Try adjusting your search or filters to find more teammates.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sent">
            <Card>
              <CardHeader>
                <CardTitle>Sent Invitations</CardTitle>
                <CardDescription>Track the status of invitations you've sent to potential teammates.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="flex flex-col divide-y">
                    {invitations.map((invitation) => (
                      <div key={invitation.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>{invitation.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{invitation.name}</p>
                            <p className="text-sm text-muted-foreground">Sent on {invitation.date}</p>
                          </div>
                        </div>

                        <Badge
                          variant={invitation.status === "pending" ? "default" : "outline"}
                          className={
                            invitation.status === "accepted"
                              ? "bg-success/10 text-success"
                              : invitation.status === "declined"
                                ? "bg-destructive/10 text-destructive"
                                : ""
                          }
                        >
                          {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">My Teams</h2>
              <Button onClick={() => setCreateTeamDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Create New Team
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {teams.map((team) => (
                <Card key={team.id} className="card-hover-effect overflow-hidden">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
                    <CardHeader className="relative pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle>{team.name}</CardTitle>
                        <Badge>{team.status}</Badge>
                      </div>
                      <CardDescription>{team.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="mb-4 flex -space-x-2">
                        {team.members.slice(0, 4).map((member, index) => (
                          <Avatar key={index} className="border-2 border-background">
                            <AvatarFallback>{member.avatar}</AvatarFallback>
                          </Avatar>
                        ))}
                        {team.members.length > 4 && (
                          <Avatar className="border-2 border-background">
                            <AvatarFallback>{`+${team.members.length - 4}`}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Created on {team.created} • {team.members.length} members
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setSelectedTeam(team)
                            setViewTeamDialog(true)
                          }}
                        >
                          <Info className="mr-2 h-4 w-4" />
                          View Team
                        </Button>
                        <Button variant="outline" size="sm">
                          Chat
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* View Team Dialog */}
        <Dialog open={viewTeamDialog} onOpenChange={setViewTeamDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedTeam?.name}</DialogTitle>
              <DialogDescription>{selectedTeam?.description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge className="mt-1">{selectedTeam?.status}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">{selectedTeam?.created}</p>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold">Team Members</h4>
                <div className="space-y-3">
                  {selectedTeam?.members.map((member, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{member.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold">Project Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Deadline</p>
                    <p className="text-sm text-muted-foreground">{selectedTeam?.project.deadline}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Progress</p>
                    <p className="text-sm text-muted-foreground">{selectedTeam?.project.progress}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium">Next Meeting</p>
                    <p className="text-sm text-muted-foreground">{selectedTeam?.project.nextMeeting}</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setViewTeamDialog(false)}>
                Close
              </Button>
              <Button>Chat with Team</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Team Dialog */}
        <Dialog open={createTeamDialog} onOpenChange={setCreateTeamDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>Create a team and invite members to join.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  placeholder="Enter team name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team-description">Description</Label>
                <Textarea
                  id="team-description"
                  placeholder="Describe your team's purpose or project"
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Add Members</Label>
                <div className="rounded-md border p-4 max-h-[200px] overflow-y-auto">
                  <div className="space-y-2">
                    {matchData.map((match) => (
                      <div key={match.id} className="flex items-center">
                        <Checkbox
                          id={`member-${match.id}`}
                          checked={selectedMembers.includes(match.name)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedMembers([...selectedMembers, match.name])
                            } else {
                              setSelectedMembers(selectedMembers.filter((name) => name !== match.name))
                            }
                          }}
                        />
                        <Label htmlFor={`member-${match.id}`} className="ml-2 flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {match.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span>{match.name}</span>
                          <Badge variant="outline" className="ml-1 text-xs">
                            {match.compatibility}% match
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateTeamDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTeam}>Create Team</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

