"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, X, Info, Mail, UserPlus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

export default function InvitationsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("received")
  const [receivedInvitations, setReceivedInvitations] = useState<any[]>([])
  const [viewTeamDialog, setViewTeamDialog] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        setIsLoading(true)
        // Get current session
        const session = await fetch('/api/auth/session')
        const sessionData = await session.json()
        
        if (sessionData && sessionData.user) {
          // Fetch invitations for the current user
          const response = await fetch(`/api/invitations?userId=${sessionData.user.id}`)
          if (response.ok) {
            const invitationsData = await response.json()
            setReceivedInvitations(invitationsData || [])
          }
        }
      } catch (error) {
        console.error('Error fetching invitations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvitations()
  }, [])

  const handleAccept = async (id: string) => {
    try {
      const response = await fetch('/api/invitations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId: id, status: 'accepted' }),
      })

      if (response.ok) {
        setReceivedInvitations(
          receivedInvitations.map((invitation) =>
            invitation._id === id ? { ...invitation, status: "accepted" } : invitation,
          ),
        )
        toast({
          title: "Invitation accepted",
          description: "You have joined the team successfully.",
        })
      } else {
        throw new Error('Failed to accept invitation')
      }
    } catch (error) {
      console.error('Error accepting invitation:', error)
      toast({
        title: "Error",
        description: "Failed to accept invitation. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDecline = async (id: string) => {
    try {
      const response = await fetch('/api/invitations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId: id, status: 'declined' }),
      })

      if (response.ok) {
        setReceivedInvitations(
          receivedInvitations.map((invitation) =>
            invitation._id === id ? { ...invitation, status: "declined" } : invitation,
          ),
        )
        toast({
          title: "Invitation declined",
          description: "You have declined the invitation.",
        })
      } else {
        throw new Error('Failed to decline invitation')
      }
    } catch (error) {
      console.error('Error declining invitation:', error)
      toast({
        title: "Error",
        description: "Failed to decline invitation. Please try again.",
        variant: "destructive"
      })
    }
  }

  const viewTeam = (invitation: any) => {
    setSelectedTeam({
      name: invitation.team?.name || "Unknown Team",
      description: invitation.team?.description || "No description available",
      from: invitation.sender?.name || "Unknown Sender",
      members: invitation.team?.members || [],
      project: invitation.team?.project || { deadline: "Not set", progress: "0%", nextMeeting: "Not scheduled" },
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
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : receivedInvitations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No Invitations</h3>
                  <p className="text-muted-foreground mt-1">
                    You don't have any team invitations yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              receivedInvitations.map((invitation) => (
                <Card key={invitation._id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="flex-1 p-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={invitation.sender?.image} alt={invitation.sender?.name} />
                            <AvatarFallback>{invitation.sender?.name?.[0] || "?"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold">Invitation to Join "{invitation.team?.name || 'Unknown Team'}"</h3>
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
                              From: {invitation.sender?.name || 'Unknown'} • Sent on: {new Date(invitation.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-md bg-muted p-4">
                          <p className="text-sm">{invitation.message || 'No message provided'}</p>
                        </div>
                      </div>

                      <div className="flex flex-row justify-end gap-2 border-t bg-muted/50 p-4 sm:flex-col sm:border-l sm:border-t-0">
                        {invitation.status === "pending" && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleAccept(invitation._id)}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleDecline(invitation._id)}
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
              ))
            )}
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

