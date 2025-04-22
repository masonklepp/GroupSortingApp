"use client"

import { Dialog } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Users, Search, Sliders, Info, MessageSquare, Check, X, Mail } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"

export default function TeamMatchingPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(tabParam || "matches")
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [matchData, setMatchData] = useState<any[]>([])
  const [filteredMatches, setFilteredMatches] = useState<any[]>([])
  const [viewTeamDialog, setViewTeamDialog] = useState(false)
  const [generatingMatches, setGeneratingMatches] = useState(false)
  
  // Add a proper type definition for team members
  interface TeamMember {
    name: string;
    role: string;
    avatar: string;
    user?: string; // Added for MongoDB data structure compatibility
  }
  
  interface Team {
    id: number;
    _id?: string; // Added for MongoDB data structure compatibility
    name: string;
    description: string;
    status: string;
    created: string;
    members: TeamMember[];
    project: {
      deadline: string;
      progress: string;
      nextMeeting: string;
    };
  }
  
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [invitations, setInvitations] = useState<any[]>([])
  const [receivedInvitations, setReceivedInvitations] = useState<any[]>([])

  // Add these state variables after the other useState declarations
  const [createTeamDialog, setCreateTeamDialog] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamDescription, setNewTeamDescription] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [teams, setTeams] = useState<any[]>([])

  // Add a state for sent invitations
  const [sentInvitations, setSentInvitations] = useState<any[]>([])

  // Add state for invitation dialog
  const [inviteDialog, setInviteDialog] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedTeamForInvite, setSelectedTeamForInvite] = useState<string>('');

  // Extract fetchMatches function to component scope
  const fetchMatches = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/matches')
      
      if (response.ok) {
        const data = await response.json()
        
        // Format the data for display
        const formattedData = data.map((match: any) => ({
          id: match.user.id,
          name: match.user.name,
          compatibility: match.compatibilityScore,
          role: match.user.role,
          skills: match.user.skills || [],
          availability: match.user.availability,
          avatar: match.user.image || '/placeholder.svg?height=40&width=40',
          email: match.user.email,
          bio: match.user.bio || 'No bio information available',
          matchFactors: match.matchFactors,
          workingStyle: match.user.workingStyle || {
            communication: 'Not specified',
            workHours: 'Not specified',
            teamSize: 'Not specified',
            learningStyle: 'Not specified'
          }
        }))
        
        setMatchData(formattedData)
        setFilteredMatches(formattedData)
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  // Update team creation to save to the database
  const handleCreateTeam = async () => {
    if (!newTeamName) {
      toast({
        title: "Team name required",
        description: "Please enter a name for your team."
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Get current session
      const sessionResponse = await fetch('/api/auth/session');
      const sessionData = await sessionResponse.json();
      
      if (!sessionData || !sessionData.user) {
        toast({
          title: "Authentication error",
          description: "Please log in to create a team."
        });
        setLoading(false);
        return;
      }
      
      // Format selected members for the database
      const membersList = [
        {
          user: sessionData.user.id,
          role: "Team Lead",
          joinedAt: new Date()
        },
        ...selectedMembers.map((memberName) => {
          const matchedUser = matchData.find((m) => m.name === memberName);
          return {
            user: matchedUser?.id,
            role: matchedUser?.role || "Member",
            joinedAt: new Date()
          };
        })
      ];
      
      // Create team in the database
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
      name: newTeamName,
      description: newTeamDescription || "New Project",
          ownerId: sessionData.user.id,
          members: membersList,
      project: {
            deadline: null,
        progress: "0%",
            nextMeeting: null
          }
        })
      });
      
      if (response.ok) {
        const newTeam = await response.json();
        console.log("Team created successfully:", newTeam);
        
        // Refresh teams
        await fetchUserData();
        
        // Reset form fields
        setNewTeamName("");
        setNewTeamDescription("");
        setSelectedMembers([]);
        setCreateTeamDialog(false);

    toast({
      title: "Team created",
          description: `${newTeamName} has been created successfully.`
        });
      } else {
        const errorData = await response.json();
        console.error("Failed to create team:", errorData);
        
        toast({
          title: "Error",
          description: errorData.error || "Failed to create team. Please try again."
        });
      }
    } catch (error) {
      console.error("Error creating team:", error);
      
      toast({
        title: "Error",
        description: "Failed to create team. Please try again."
      });
    } finally {
      setLoading(false);
    }
  }

  // Define the fetchUserData function before it's used
  const fetchUserData = async () => {
    try {
      // Get current session
      const sessionResponse = await fetch('/api/auth/session');
      const sessionData = await sessionResponse.json();
      
      if (!sessionData || !sessionData.user) {
        console.error('No session data available');
        toast({
          title: "Authentication error",
          description: "Please log in to view your teams and invitations."
        });
        return;
      }
      
      console.log('Session user:', sessionData.user);
      setLoading(true);
      
      // Fetch teams
      const teamsResponse = await fetch(`/api/teams?userId=${sessionData.user.id}`);
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        console.log('Teams data:', teamsData);
        setTeams(teamsData || []);
      } else {
        console.error('Failed to fetch teams:', await teamsResponse.text());
      }
      
      // Fetch invitations
      const invitationsResponse = await fetch(`/api/invitations?userId=${sessionData.user.id}`);
      if (invitationsResponse.ok) {
        const invitationsData = await invitationsResponse.json();
        console.log("Fetched invitations:", invitationsData);
        setInvitations(invitationsData || []);
        
        // Set received invitations (where user is recipient)
        const received = invitationsData.filter((inv: any) => {
          // Check by comparing user IDs in different formats
          const isRecipient = 
            (inv.recipient?._id === sessionData.user.id) || 
            (inv.recipient === sessionData.user.id) ||
            (inv.recipient?.id === sessionData.user.id);
          
          console.log(`Invitation ${inv._id}:`, { 
            invRecipient: inv.recipient?._id || inv.recipient, 
            sessionUserId: sessionData.user.id,
            isRecipient
          });
          
          return isRecipient;
        });
        
        console.log("Received invitations:", received);
        setReceivedInvitations(received);
        
        // Set sent invitations (where user is sender)
        const sent = invitationsData.filter((inv: any) => {
          // Check by comparing user IDs in different formats
          const isSender = 
            (inv.sender?._id === sessionData.user.id) || 
            (inv.sender === sessionData.user.id) ||
            (inv.sender?.id === sessionData.user.id);
          
          console.log(`Invitation ${inv._id}:`, { 
            invSender: inv.sender?._id || inv.sender, 
            sessionUserId: sessionData.user.id,
            isSender
          });
          
          return isSender;
        });
        
        console.log("Sent invitations:", sent);
        setSentInvitations(sent);
      } else {
        console.error('Failed to fetch invitations:', await invitationsResponse.text());
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load your data. Please refresh the page."
      });
    } finally {
      setLoading(false);
    }
  }

  // Add handle accept/decline functions
  const handleAccept = async (id: string) => {
    try {
      console.log('Accepting invitation:', id);
      
      const response = await fetch('/api/invitations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId: id, status: 'accepted' }),
      });

      if (response.ok) {
        const updatedInvitation = await response.json();
        console.log('Invitation accepted:', updatedInvitation);
        
        // Update both invitations lists
        setInvitations(
          invitations.map((invitation) =>
            invitation._id === id ? { ...invitation, status: "accepted" } : invitation,
          )
        );
        setReceivedInvitations(
          receivedInvitations.map((invitation) =>
            invitation._id === id ? { ...invitation, status: "accepted" } : invitation,
          )
        );
        
        toast({
          title: "Invitation accepted",
          description: "You have joined the team successfully.",
        });
        
        // Refresh teams list
        fetchUserData();
      } else {
        const errorData = await response.json();
        console.error('Failed to accept invitation:', errorData);
        throw new Error(errorData.error || 'Failed to accept invitation');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: "Failed to accept invitation. Please try again."
      });
    }
  };

  const handleDecline = async (id: string) => {
    try {
      console.log('Declining invitation:', id);
      
      const response = await fetch('/api/invitations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId: id, status: 'declined' }),
      });

      if (response.ok) {
        const updatedInvitation = await response.json();
        console.log('Invitation declined:', updatedInvitation);
        
        // Update both invitations lists
        setInvitations(
          invitations.map((invitation) =>
            invitation._id === id ? { ...invitation, status: "declined" } : invitation,
          )
        );
        setReceivedInvitations(
          receivedInvitations.map((invitation) =>
            invitation._id === id ? { ...invitation, status: "declined" } : invitation,
          )
        );
        
        toast({
          title: "Invitation declined",
          description: "You have declined the invitation.",
        });
      } else {
        const errorData = await response.json();
        console.error('Failed to decline invitation:', errorData);
        throw new Error(errorData.error || 'Failed to decline invitation');
      }
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast({
        title: "Error",
        description: "Failed to decline invitation. Please try again."
      });
    }
  };

  // Fix the helper function with proper typing
  const isUserAlreadyTeamMember = (userId: string, teamId: string) => {
    const team = teams.find(t => t._id === teamId || t.id === teamId);
    if (!team) return false;
    
    return team.members.some((member: any) => 
      (member.user?._id === userId || member.user === userId) || 
      member.name === matchData.find(m => m.id === userId)?.name
    );
  };

  // Update sendInvitation to check if user is already a team member
  const sendInvitation = async () => {
    if (!selectedMatch || !selectedTeamForInvite) {
      toast({
        title: "Missing information",
        description: "Please select both a team and a user to invite.",
      });
      return;
    }
    
    // Get current session to get the sender ID
    try {
      setLoading(true);
      
      const sessionResponse = await fetch('/api/auth/session');
      const sessionData = await sessionResponse.json();
      
      if (!sessionData || !sessionData.user) {
        toast({
          title: "Authentication error",
          description: "Please log in to send invitations."
        });
        setLoading(false);
        return;
      }
      
      // Check if the user already has an invitation to this team
      const existingInvitation = sentInvitations.find(
        inv => (inv.recipient?._id === selectedMatch.id || inv.recipient === selectedMatch.id) && 
              (inv.team?._id === selectedTeamForInvite || inv.team === selectedTeamForInvite)
      );
      
      if (existingInvitation) {
        toast({
          title: "Invitation exists",
          description: `You have already invited ${selectedMatch.name} to this team.`,
        });
        setInviteDialog(false);
        setLoading(false);
        return;
      }
      
      // Check if user is already a member of this team
      if (isUserAlreadyTeamMember(selectedMatch.id, selectedTeamForInvite)) {
        toast({
          title: "Already a member",
          description: `${selectedMatch.name} is already a member of this team.`,
        });
        setInviteDialog(false);
        setLoading(false);
        return;
      }
      
      console.log('Sending invitation with data:', {
        senderId: sessionData.user.id,
        recipientId: selectedMatch.id,
        teamId: selectedTeamForInvite,
        message: inviteMessage || `I'd like to invite you to join my team based on our ${selectedMatch.compatibility}% compatibility match.`
      });
      
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: sessionData.user.id,
          recipientId: selectedMatch.id,
          teamId: selectedTeamForInvite,
          message: inviteMessage || `I'd like to invite you to join my team based on our ${selectedMatch.compatibility}% compatibility match.`
        })
      });
      
      let errorText = '';
      try {
        const responseData = await response.json();
        console.log('API Response:', response.status, responseData);
        
        if (response.ok) {
          console.log('Invitation created successfully:', responseData);
          
          toast({
            title: "Invitation sent",
            description: `Invitation sent to ${selectedMatch.name}`
          });
          
          // Refresh sent invitations
          await fetchUserData();
          // Close dialog and reset state
          setInviteDialog(false);
          setInviteMessage('');
          setSelectedMatch(null);
          setSelectedTeamForInvite('');
        } else {
          errorText = responseData.error || "Failed to send invitation. Please try again.";
          console.error('Error response:', errorText);
          
          toast({
            title: "Error", 
            description: errorText
          });
        }
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        errorText = "Failed to process server response";
        
        toast({
          title: "Error",
          description: "Failed to send invitation. Server response could not be processed."
        });
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch matches and user data on component mount
    fetchMatches()
    fetchUserData()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      setFilteredMatches(
        matchData.filter(
          (match) =>
            match.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            match.skills.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
            match.role.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    } else {
      setFilteredMatches(matchData)
    }
  }, [searchQuery, matchData])

  // Use this effect to handle URL tab changes
  useEffect(() => {
    if (tabParam && ["matches", "invites", "sent", "teams"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Helper function to format dates for team display
  const formatTeamDate = (date: any): string => {
    if (!date) return "Not set";
    if (date === null) return "Not set";
    
    try {
      return new Date(date).toLocaleDateString();
    } catch (e) {
      return "Invalid date";
    }
  };

  // Add a function to generate matches
  const generateMatches = async () => {
    try {
      setGeneratingMatches(true);
      
      const response = await fetch('/api/matches/generate', {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Matches Generated",
          description: `Successfully created ${result.matchesCreated} matches between ${result.totalUsers} users.`,
        });
        
        // Refresh matches
        await fetchMatches();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to generate matches.",
        });
      }
    } catch (error) {
      console.error("Error generating matches:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while generating matches.",
      });
    } finally {
      setGeneratingMatches(false);
    }
  };

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
            <Button 
              onClick={generateMatches} 
              disabled={generatingMatches}
              variant="outline"
            >
              {generatingMatches ? (
                <>Generating...</>
              ) : (
                <>Generate Matches</>
              )}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="matches" className="gap-2">
              <Users className="h-4 w-4" />
              Matches
              <Badge variant="secondary" className="ml-1">
                {filteredMatches.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="invites" className="gap-2 relative">
              <MessageSquare className="h-4 w-4" />
              Invites
              <Badge variant="secondary" className="ml-1">
                {receivedInvitations.filter(inv => inv.status === 'pending').length}
              </Badge>
              {receivedInvitations.filter(inv => inv.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Sent
              <Badge variant="secondary" className="ml-1">
                {sentInvitations.length}
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
              <>
                {teams.length === 0 && (
                  <Card className="mb-4 border-amber-200 dark:border-amber-800">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
                        <Users className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                      </div>
                      <div>
                        <h3 className="font-medium">You need to create or join a team first</h3>
                        <p className="text-sm text-muted-foreground">
                          Before you can invite others, you need to create a team or be part of an existing team.
                        </p>
                      </div>
                      <Button 
                        className="ml-auto"
                        onClick={() => setCreateTeamDialog(true)}
                      >
                        Create Team
                      </Button>
                    </CardContent>
                  </Card>
                )}
                {filteredMatches.map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match}
                    onInvite={(selectedMatch) => {
                      setSelectedMatch(selectedMatch);
                      setInviteDialog(true);
                    }}
                    hasTeams={teams.length > 0}
                  />
                ))}
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="rounded-full bg-muted p-3">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-foreground">No matches found</h3>
                  <p className="text-center text-muted-foreground mb-2">
                    {session?.user ? 
                      "It looks like you're new here! You need to generate matches to see compatible teammates." :
                      "Try adjusting your search or filters to find more teammates."}
                  </p>
                  <p className="text-center text-sm text-muted-foreground mb-4">
                    {session?.user && "You can generate matches now or update your profile with more information for better match results."}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={generateMatches}
                      disabled={generatingMatches}
                    >
                      {generatingMatches ? (
                        <>Generating Matches...</>
                      ) : (
                        <>Generate Matches</>
                      )}
                    </Button>
                    {session?.user && (
                      <Button 
                        variant="outline"
                        onClick={() => window.location.href = '/profile'}
                      >
                        Update Profile
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="invites" className="space-y-6">
            {loading ? (
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
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1" 
                          onClick={() => {
                            setSelectedTeam({
                              id: 0,
                              name: invitation.team?.name || "Unknown Team",
                              description: invitation.team?.description || "No description available",
                              status: "Active",
                              created: new Date(invitation.createdAt).toLocaleDateString(),
                              members: invitation.team?.members || [],
                              project: {
                                deadline: invitation.team?.project?.deadline ? formatTeamDate(invitation.team.project.deadline) : "Not set",
                                progress: invitation.team?.project?.progress || "0%",
                                nextMeeting: invitation.team?.project?.nextMeeting ? formatTeamDate(invitation.team.project.nextMeeting) : "Not scheduled"
                              }
                            })
                            setViewTeamDialog(true)
                          }}
                        >
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

          <TabsContent value="sent">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : sentInvitations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No Sent Invitations</h3>
                  <p className="text-muted-foreground mt-1">
                    You haven't sent any team invitations yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
            <Card>
              <CardHeader>
                <CardTitle>Sent Invitations</CardTitle>
                <CardDescription>Track the status of invitations you've sent to potential teammates.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="flex flex-col divide-y">
                      {sentInvitations.map((invitation) => (
                        <div key={invitation._id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <Avatar>
                              <AvatarImage src={invitation.recipient?.image} />
                              <AvatarFallback>{invitation.recipient?.name?.[0] || '?'}</AvatarFallback>
                          </Avatar>
                          <div>
                              <p className="font-medium">{invitation.recipient?.name || "Unknown Recipient"}</p>
                              <p className="text-sm text-muted-foreground">
                                Sent to join "{invitation.team?.name || 'Unknown Team'}" • 
                                {new Date(invitation.createdAt).toLocaleDateString()}
                              </p>
                          </div>
                        </div>

                        <Badge
                          variant={invitation.status === "pending" ? "default" : "outline"}
                          className={
                            invitation.status === "accepted"
                                ? "bg-green-500/10 text-green-500"
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
            )}
          </TabsContent>

          <TabsContent value="teams">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">My Teams</h2>
              <Button onClick={() => setCreateTeamDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Create New Team
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {loading ? (
                // Show team skeletons when loading
                Array(2).fill(0).map((_, i) => (
                  <Card key={i} className="card-hover-effect overflow-hidden">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
                    <CardHeader className="relative pb-2">
                      <div className="flex items-center justify-between">
                          <Skeleton className="h-6 w-32" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <Skeleton className="h-4 w-48 mt-2" />
                      </CardHeader>
                      <CardContent className="relative">
                        <div className="mb-4 flex -space-x-2">
                          {Array(3).fill(0).map((_, j) => (
                            <Skeleton key={j} className="h-8 w-8 rounded-full" />
                          ))}
                        </div>
                        <Skeleton className="h-4 w-36 mb-4" />
                        <div className="mt-4 flex gap-2">
                          <Skeleton className="h-9 w-24" />
                          <Skeleton className="h-9 w-16" />
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))
              ) : teams.length > 0 ? (
                teams.map((team) => (
                  <Card key={team._id || team.id} className="card-hover-effect overflow-hidden">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
                      <CardHeader className="relative pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-foreground">{team.name}</CardTitle>
                          <Badge>{team.status || 'Active'}</Badge>
                      </div>
                      <CardDescription>{team.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="mb-4 flex -space-x-2">
                          {team.members && team.members.slice(0, 4).map((member: any, index: number) => (
                          <Avatar key={index} className="border-2 border-background">
                              {member.user?.image ? (
                                <AvatarImage src={member.user.image} alt={member.user?.name || 'Member'} />
                              ) : (
                                <AvatarFallback>
                                  {member.user?.name ? 
                                    member.user.name.split(" ").map((n: string) => n[0]).join("") 
                                    : member.name ? 
                                      member.name.split(" ").map((n: string) => n[0]).join("")
                                      : "UN"}
                                </AvatarFallback>
                              )}
                          </Avatar>
                        ))}
                          {team.members && team.members.length > 4 && (
                          <Avatar className="border-2 border-background">
                            <AvatarFallback>{`+${team.members.length - 4}`}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                          Created on {new Date(team.createdAt || team.created).toLocaleDateString()} • {team.members?.length || 0} members
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                              setSelectedTeam({
                                id: team._id || team.id,
                                _id: team._id,
                                name: team.name,
                                description: team.description,
                                status: team.status || 'Active',
                                created: new Date(team.createdAt || team.created).toLocaleDateString(),
                                members: team.members?.map((m: any) => ({
                                  name: m.user?.name || m.name || 'Unknown Member',
                                  role: m.role || 'Member',
                                  avatar: m.user?.name ? 
                                    m.user.name.split(" ").map((n: string) => n[0]).join("") :
                                    m.name ? m.name.split(" ").map((n: string) => n[0]).join("") : "UN"
                                })) || [],
                                project: {
                                  deadline: team.project?.deadline ? formatTeamDate(team.project.deadline) : "Not set",
                                  progress: team.project?.progress || "0%",
                                  nextMeeting: team.project?.nextMeeting ? formatTeamDate(team.project.nextMeeting) : "Not scheduled"
                                }
                              });
                              setViewTeamDialog(true);
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
                ))
              ) : (
                <Card className="col-span-2">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="rounded-full bg-muted p-3">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-foreground">No teams yet</h3>
                    <p className="text-center text-muted-foreground">
                      Create your first team to start collaborating with others.
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => setCreateTeamDialog(true)}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Team
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* View Team Dialog */}
        <Dialog open={viewTeamDialog} onOpenChange={setViewTeamDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">{selectedTeam?.name}</DialogTitle>
              <DialogDescription>{selectedTeam?.description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Status</p>
                  <Badge className="mt-1">{selectedTeam?.status}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Created</p>
                  <p className="text-sm text-muted-foreground">{selectedTeam?.created}</p>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-foreground">Team Members</h4>
                <div className="space-y-3">
                  {selectedTeam?.members.map((member: TeamMember, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{member.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-foreground">Project Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Deadline</p>
                    <p className="text-sm text-muted-foreground">{selectedTeam?.project.deadline}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Progress</p>
                    <p className="text-sm text-muted-foreground">{selectedTeam?.project.progress}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-foreground">Next Meeting</p>
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
              <DialogTitle className="text-foreground">Create New Team</DialogTitle>
              <DialogDescription>Create a team and invite members to join.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="team-name" className="text-foreground">Team Name</Label>
                <Input
                  id="team-name"
                  placeholder="Enter team name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team-description" className="text-foreground">Description</Label>
                <Textarea
                  id="team-description"
                  placeholder="Describe your team's purpose or project"
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Add Members</Label>
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
                        <Label htmlFor={`member-${match.id}`} className="ml-2 flex items-center gap-2 text-foreground">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {match.name
                                .split(" ")
                                .map((n: string) => n[0])
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

        {/* Invitation Dialog */}
        <Dialog open={inviteDialog} onOpenChange={setInviteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Invite to Your Team</DialogTitle>
              <DialogDescription>
                Send an invitation to {selectedMatch?.name} to join one of your teams.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="team-select" className="text-foreground">Select Team</Label>
                <Select 
                  value={selectedTeamForInvite} 
                  onValueChange={setSelectedTeamForInvite}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id || team._id} value={team.id || team._id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-message" className="text-foreground">Invitation Message</Label>
                <Textarea
                  id="invite-message"
                  placeholder="Enter a personal message to accompany your invitation..."
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={sendInvitation}>
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

