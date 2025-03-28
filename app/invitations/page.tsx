"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, X, UserPlus, Mail, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

const initialInvitations = [
  {
    id: 1,
    teamName: "Project Alpha",
    from: "Alice Cooper",
    status: "pending",
    date: "March 1, 2025",
    message: "Hi there! I think your skills would be a great fit for our project. Would you like to join our team?",
    avatar: "/placeholder.svg?height=40&width=40",
    teamDetails: {
      description: "Web Development Project",
      members: [
        { name: "Alice Cooper", role: "Team Lead", avatar: "AC" },
        { name: "Bob Smith", role: "Frontend Developer", avatar: "BS" },
        { name: "Carol White", role: "Backend Developer", avatar: "CW" },
      ],
      project: {
        deadline: "June 15, 2025",
        progress: "35%",
        nextMeeting: "March 22, 2025 at 2:00 PM",
      },
    },
  },
  {
    id: 2,
    teamName: "Design Innovators",
    from: "Bob Smith",
    status: "accepted",
    date: "February 25, 2025",
    message: "We need someone with your design skills. Let me know if you're interested!",
    avatar: "/placeholder.svg?height=40&width=40",
    teamDetails: {
      description: "UI/UX Design Project",
      members: [
        { name: "Bob Smith", role: "Design Lead", avatar: "BS" },
        { name: "Diana Evans", role: "UI Designer", avatar: "DE" },
        { name: "Eric Foster", role: "UX Researcher", avatar: "EF" },
      ],
      project: {
        deadline: "May 30, 2025",
        progress: "60%",
        nextMeeting: "March 18, 2025 at 10:00 AM",
      },
    },
  },
  {
    id: 3,
    teamName: "Code Masters",
    from: "Carol White",
    status: "declined",
    date: "February 20, 2025",
    message: "Looking for a developer with React experience. Would you like to join our team?",
    avatar: "/placeholder.svg?height=40&width=40",
    teamDetails: {
      description: "Mobile App Development",
      members: [
        { name: "Carol White", role: "Project Manager", avatar: "CW" },
        { name: "Frank Johnson", role: "React Native Developer", avatar: "FJ" },
        { name: "Grace Lee", role: "Backend Developer", avatar: "GL" },
      ],
      project: {
        deadline: "July 10, 2025",
        progress: "25%",
        nextMeeting: "March 25, 2025 at 3:30 PM",
      },
    },
  },
]

export default function InvitationsPage() {
  const [activeTab, setActiveTab] = useState("received")
  const [receivedInvitations, setReceivedInvitations] = useState(initialInvitations)
  const [viewTeamDialog, setViewTeamDialog] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<any>(null)

  const handleAccept = (id: number) => {
    setReceivedInvitations(
      receivedInvitations.map((invitation) =>
        invitation.id === id ? { ...invitation, status: "accepted" } : invitation,
      ),
    )
    toast({
      title: "Invitation accepted",
      description: "You have joined the team successfully.",
    })
  }

  const handleDecline = (id: number) => {
    setReceivedInvitations(
      receivedInvitations.map((invitation) =>
        invitation.id === id ? { ...invitation, status: "declined" } : invitation,
      ),
    )
    toast({
      title: "Invitation declined",
      description: "You have declined the invitation.",
    })
  }

  const viewTeam = (invitation: any) => {
    setSelectedTeam({
      name: invitation.teamName,
      description: invitation.teamDetails.description,
      from: invitation.from,
      members: invitation.teamDetails.members,
      project: invitation.teamDetails.project,
    })
    setViewTeamDialog(true)
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-3xl font-bold">Group Invitations</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received">
              <Mail className="mr-2 h-4 w-4" />
              Received
            </TabsTrigger>
            <TabsTrigger value="send">
              <UserPlus className="mr-2 h-4 w-4" />
              Send New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-6">
            {receivedInvitations.map((invitation) => (
              <Card key={invitation.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex-1 p-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={invitation.avatar} alt={invitation.from} />
                          <AvatarFallback>{invitation.from.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">Invitation to Join "{invitation.teamName}"</h3>
                            {invitation.status === "pending" && <Badge>Pending</Badge>}
                            {invitation.status === "accepted" && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                                Accepted
                              </Badge>
                            )}
                            {invitation.status === "declined" && (
                              <Badge variant="outline" className="bg-destructive/10 text-destructive">
                                Declined
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            From: {invitation.from} • Sent on: {invitation.date}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-md bg-muted p-4">
                        <p className="text-sm">{invitation.message}</p>
                      </div>
                    </div>

                    <div className="flex flex-row justify-end gap-2 border-t bg-muted/50 p-4 sm:flex-col sm:border-l sm:border-t-0">
                      {invitation.status === "pending" && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleAccept(invitation.id)}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDecline(invitation.id)}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Decline
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" className="flex-1" onClick={() => viewTeam(invitation)}>
                        <Info className="mr-2 h-4 w-4" />
                        View Team
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle>Send a New Invitation</CardTitle>
                <CardDescription>Invite someone to join your team or create a new team.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Name or Email</Label>
                  <Input id="recipient" placeholder="Enter name or email address" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team">Team</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project-alpha">Project Alpha</SelectItem>
                      <SelectItem value="research-group">Research Group B</SelectItem>
                      <SelectItem value="new">Create New Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Invitation Message</Label>
                  <Textarea id="message" placeholder="Enter your message..." className="min-h-[120px]" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Send Invitation</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Team View Dialog */}
      <Dialog open={viewTeamDialog} onOpenChange={setViewTeamDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedTeam?.name}</DialogTitle>
            <DialogDescription>{selectedTeam?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <p className="text-sm font-medium">Team Lead</p>
              <p className="text-sm text-muted-foreground">{selectedTeam?.from}</p>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold">Team Members</h4>
              <div className="space-y-3">
                {selectedTeam?.members.map((member: any, index: number) => (
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
            <Button>Contact Team</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

