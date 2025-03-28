"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, UserPlus, User } from "lucide-react"
import { ProgressRing } from "@/components/progress-ring"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"

interface MatchCardProps {
  match: {
    id: number
    name: string
    compatibility: number
    skills: string[]
    role: string
    availability: string
    avatar: string
  }
}

export function MatchCard({ match }: MatchCardProps) {
  // First, add a new state for the profile dialog
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Determine color based on compatibility
  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return "text-emerald-500"
    if (score >= 80) return "text-primary"
    if (score >= 70) return "text-accent"
    return "text-amber-500"
  }

  return (
    <Card
      className="overflow-hidden transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative flex-1 p-6">
            {/* Animated background gradient on hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 transition-opacity duration-500 ${isHovered ? "opacity-100" : ""}`}
            />

            <div className="relative">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={match.avatar} alt={match.name} />
                  <AvatarFallback>{match.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{match.name}</h3>
                  <p className="text-sm text-muted-foreground">Preferred Role: {match.role}</p>
                </div>
                <div className="ml-auto">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <ProgressRing
                            progress={match.compatibility}
                            size={70}
                            strokeWidth={5}
                            textClassName={getCompatibilityColor(match.compatibility)}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Compatibility Score</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="mt-6">
                <span className="text-sm font-medium">Skills:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {match.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="skill-tag transition-all hover:bg-secondary hover:text-secondary-foreground"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <span className="text-sm font-medium">Availability:</span>
                <p className="text-sm text-muted-foreground">{match.availability}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-row justify-end gap-2 border-t bg-muted/30 p-4 backdrop-blur-sm sm:flex-col sm:border-l sm:border-t-0">
            <Button variant="default" size="sm" className="flex-1 gap-2" onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Invite
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => setMessageDialogOpen(true)}>
              <MessageSquare className="h-4 w-4" />
              Message
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 gap-2" onClick={() => setProfileDialogOpen(true)}>
              <User className="h-4 w-4" />
              Profile
            </Button>
          </div>
        </div>
      </CardContent>

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite to Team</DialogTitle>
            <DialogDescription>Send an invitation to {match.name} to join your team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={match.avatar} alt={match.name} />
                <AvatarFallback>{match.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{match.name}</p>
                <p className="text-sm text-muted-foreground">Compatibility: {match.compatibility}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team">Select Team</Label>
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
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder={`Hi ${match.name}, I'd like to invite you to join my team...`}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setInviteDialogOpen(false)}>Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>Send a message to {match.name} to discuss collaboration.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={match.avatar} alt={match.name} />
                <AvatarFallback>{match.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{match.name}</p>
                <p className="text-sm text-muted-foreground">Compatibility: {match.compatibility}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Enter message subject" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message-content">Message</Label>
              <Textarea
                id="message-content"
                placeholder={`Hi ${match.name}, I'd like to discuss a potential collaboration...`}
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Here you would typically send the message
                setMessageDialogOpen(false)
                // Show a success notification or feedback
              }}
            >
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>View {match.name}'s complete profile information</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Avatar className="h-20 w-20">
                <AvatarImage src={match.avatar} alt={match.name} />
                <AvatarFallback>{match.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{match.name}</h3>
                <p className="text-sm text-muted-foreground">Preferred Role: {match.role}</p>
                <div className="mt-2 flex items-center">
                  <span className="text-sm font-medium mr-2">Compatibility:</span>
                  <Badge variant="outline" className={`${getCompatibilityColor(match.compatibility)}`}>
                    {match.compatibility}%
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">About</h4>
              <p className="text-sm text-muted-foreground">
                Computer Science student with a passion for web development and UI/UX design. Looking for teammates who
                are committed to quality and meeting deadlines.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {match.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Availability</h4>
              <p className="text-sm text-muted-foreground">{match.availability}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Working Style</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Communication</p>
                  <p className="text-muted-foreground">Prefers video calls and chat</p>
                </div>
                <div>
                  <p className="font-medium">Work Hours</p>
                  <p className="text-muted-foreground">Evenings and weekends</p>
                </div>
                <div>
                  <p className="font-medium">Team Size</p>
                  <p className="text-muted-foreground">3-5 people</p>
                </div>
                <div>
                  <p className="font-medium">Learning Style</p>
                  <p className="text-muted-foreground">Visual</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setProfileDialogOpen(false)
                setMessageDialogOpen(true)
              }}
            >
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

