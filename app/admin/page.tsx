"use client"

import { CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BarChart, Users, UserCheck, AlertCircle, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState({
    users: true,
    teams: true,
    stats: true
  })
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTeams: 0,
    pendingMatches: 0,
    satisfactionRate: "94%"
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        setLoading(prev => ({ ...prev, users: true }))
        const usersResponse = await fetch('/api/users')
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setUsers(usersData)
          setStats(prev => ({ ...prev, totalUsers: usersData.length }))
        }
        setLoading(prev => ({ ...prev, users: false }))

        // Fetch all teams
        setLoading(prev => ({ ...prev, teams: true }))
        const teamsResponse = await fetch('/api/teams')
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json()
          setTeams(teamsData)
          
          // Count active teams
          const activeTeams = teamsData.filter((team: any) => team.status === 'Active').length
          setStats(prev => ({ ...prev, activeTeams }))
          
          // Count pending matches (incomplete teams)
          const pendingTeams = teamsData.filter((team: any) => 
            team.status === 'Pending' || 
            (team.members && team.members.length < 3)
          ).length
          setStats(prev => ({ ...prev, pendingMatches: pendingTeams }))
        }
        setLoading(prev => ({ ...prev, teams: false }))
        
        setLoading(prev => ({ ...prev, stats: false }))
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading({
          users: false,
          teams: false,
          stats: false
        })
      }
    }

    fetchData()
  }, [])

  // Format initials for avatar
  const getInitials = (name: string) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading.stats ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Platform users</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading.stats ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.activeTeams}</div>
                  <p className="text-xs text-muted-foreground">Working teams</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Matches</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading.stats ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.pendingMatches}</div>
                  <p className="text-xs text-muted-foreground">Teams needing members</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.satisfactionRate}</div>
              <p className="text-xs text-muted-foreground">Overall satisfaction</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="teams">Team Management</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all users registered on the platform.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading.users ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-5 border-b bg-muted/50 p-4 font-medium">
                      <div>User Name</div>
                      <div>Email</div>
                      <div>Role</div>
                      <div>Status</div>
                      <div className="text-right">Action</div>
                    </div>
                    <div className="divide-y">
                      {users.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No users found
                        </div>
                      ) : (
                        users.map((user) => (
                          <div key={user._id} className="grid grid-cols-5 items-center p-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.image} alt={user.name} />
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                              </Avatar>
                              <span>{user.name}</span>
                            </div>
                            <div>{user.email}</div>
                            <div>{user.role}</div>
                            <div>
                              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                                Active
                              </Badge>
                            </div>
                            <div className="text-right">
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>View and manage all teams created on the platform.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading.teams ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-5 border-b bg-muted/50 p-4 font-medium">
                      <div>Team Name</div>
                      <div>Members</div>
                      <div>Project</div>
                      <div>Status</div>
                      <div className="text-right">Action</div>
                    </div>
                    <div className="divide-y">
                      {teams.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No teams found
                        </div>
                      ) : (
                        teams.map((team) => (
                          <div key={team._id} className="grid grid-cols-5 items-center p-4">
                            <div>{team.name}</div>
                            <div>{team.members?.length || 0}</div>
                            <div>{team.project?.name || 'N/A'}</div>
                            <div>
                              <Badge variant={team.status === 'Active' ? 'default' : 'outline'}>
                                {team.status}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <Button variant="ghost" size="sm">
                                Manage
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
                <CardDescription>
                  Generate various reports to monitor platform activity, team performance, and user engagement.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Team Formation Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        View statistics on team formation patterns, match success rates, and compatibility metrics.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm">
                        Generate Report
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">User Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Track user activity, profile completion rates, and platform usage patterns.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm">
                        Generate Report
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Matching Effectiveness</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Analyze the effectiveness of the matching algorithm and team satisfaction rates.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm">
                        Generate Report
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Course Integration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        View statistics on team performance across different courses and departments.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm">
                        Generate Report
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

