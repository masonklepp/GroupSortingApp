import { CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BarChart, Users, UserCheck, AlertCircle } from "lucide-react"

export default function AdminDashboardPage() {
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
              <div className="text-2xl font-bold">245</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">38</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Matches</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">16</div>
              <p className="text-xs text-muted-foreground">-2% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">+3% from last month</p>
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
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 border-b bg-muted/50 p-4 font-medium">
                    <div>User Name</div>
                    <div>Email</div>
                    <div>Role</div>
                    <div>Status</div>
                    <div className="text-right">Action</div>
                  </div>
                  <div className="divide-y">
                    <div className="grid grid-cols-5 items-center p-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <span>Jane Doe</span>
                      </div>
                      <div>jane.doe@example.com</div>
                      <div>Student</div>
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
                    <div className="grid grid-cols-5 items-center p-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>JS</AvatarFallback>
                        </Avatar>
                        <span>John Smith</span>
                      </div>
                      <div>john.smith@example.com</div>
                      <div>Student</div>
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
                    <div className="grid grid-cols-5 items-center p-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>AC</AvatarFallback>
                        </Avatar>
                        <span>Alice Cooper</span>
                      </div>
                      <div>alice.cooper@example.com</div>
                      <div>Professor</div>
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
                  </div>
                </div>
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
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 border-b bg-muted/50 p-4 font-medium">
                    <div>Team Name</div>
                    <div>Members</div>
                    <div>Project</div>
                    <div>Status</div>
                    <div className="text-right">Action</div>
                  </div>
                  <div className="divide-y">
                    <div className="grid grid-cols-5 items-center p-4">
                      <div>Project Alpha</div>
                      <div>5</div>
                      <div>Research App</div>
                      <div>
                        <Badge>Active</Badge>
                      </div>
                      <div className="text-right">
                        <Button variant="ghost" size="sm">
                          Manage
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 items-center p-4">
                      <div>Design Innovators</div>
                      <div>4</div>
                      <div>Marketing Campaign</div>
                      <div>
                        <Badge>Active</Badge>
                      </div>
                      <div className="text-right">
                        <Button variant="ghost" size="sm">
                          Manage
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 items-center p-4">
                      <div>Code Masters</div>
                      <div>6</div>
                      <div>Web Platform</div>
                      <div>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                      <div className="text-right">
                        <Button variant="ghost" size="sm">
                          Manage
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
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

