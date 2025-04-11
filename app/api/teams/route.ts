import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Team from '@/lib/models/Team';
import User from '@/lib/models/User';
import { getToken } from 'next-auth/jwt';

// Get teams for a user or all teams for admin
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // Check if this is an admin request (no userId specified)
    if (!userId) {
      // Get the auth token to verify if the requester is an admin
      const token = await getToken({ 
        req,
        secret: process.env.NEXTAUTH_SECRET
      });

      // If requester is not admin, return 403
      if (!token || token.role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized. Admin access required.' },
          { status: 403 }
        );
      }

      // Admin access - fetch all teams
      const allTeams = await Team.find({})
        .populate('creator', 'name image')
        .populate('members.user', 'name image role');

      return NextResponse.json(allTeams);
    }

    // Regular user access - find teams where the user is a creator or member
    const teams = await Team.find({
      $or: [
        { creator: userId },
        { 'members.user': userId },
      ],
    })
      .populate('creator', 'name image')
      .populate('members.user', 'name image role');

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

// Create a new team
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { name, description, ownerId, members = [], project = {} } = await req.json();
    
    console.log('Creating team with data:', { name, description, ownerId, members, project });

    // Validate required fields
    if (!name || !description || !ownerId) {
      return NextResponse.json(
        { error: 'Team name, description, and owner ID are required' },
        { status: 400 }
      );
    }

    // Check if owner exists
    const owner = await User.findById(ownerId);
    if (!owner) {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      );
    }

    // Process members array - ensure it's valid
    const validMembers = [];
    
    // First add the owner/creator as a member if not already in the list
    const ownerMemberEntry = members.find(m => m.user === ownerId);
    if (!ownerMemberEntry) {
      validMembers.push({
        user: ownerId,
        role: 'Team Lead',
        joinedAt: new Date()
      });
    }
    
    // Process other members
    for (const member of members) {
      if (!member.user) continue;
      
      try {
        // Skip if this is the owner and we already added them
        if (member.user === ownerId && !ownerMemberEntry) continue;
        
        // Validate that user exists
        const user = await User.findById(member.user).catch(() => null);
        if (user) {
          validMembers.push({
            user: member.user,
            role: member.role || user.role || 'Member',
            joinedAt: member.joinedAt || new Date()
          });
        } else {
          console.log(`User ${member.user} not found, skipping`);
        }
      } catch (memberError) {
        console.error('Error processing team member:', memberError);
        // Continue with other members, don't fail the whole operation
      }
    }
    
    console.log(`Processed ${validMembers.length} valid members`);

    // Create the team with valid structure
    const teamData = {
      name,
      description,
      status: 'Active',
      creator: ownerId,
      members: validMembers,
      project: {
        progress: '0%'
      }
    };
    
    // Add deadline and nextMeeting only if they're valid dates
    if (project) {
      if (project.deadline) {
        // Only add if it's a valid date or null
        if (project.deadline === null || !isNaN(new Date(project.deadline).getTime())) {
          teamData.project.deadline = project.deadline;
        }
      }
      
      if (project.progress) {
        teamData.project.progress = project.progress;
      }
      
      if (project.nextMeeting) {
        // Only add if it's a valid date or null
        if (project.nextMeeting === null || !isNaN(new Date(project.nextMeeting).getTime())) {
          teamData.project.nextMeeting = project.nextMeeting;
        }
      }
    }
    
    console.log('Creating team with data:', teamData);
    
    const team = await Team.create(teamData);
    
    // Return the created team with populated fields
    const populatedTeam = await Team.findById(team._id)
      .populate('creator', 'name image')
      .populate('members.user', 'name image role');
      
    return NextResponse.json(populatedTeam, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// Update a team
export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();

    const { teamId, name, description, status, project } = await req.json();

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    const team = await Team.findById(teamId);

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Update team fields
    if (name) team.name = name;
    if (description) team.description = description;
    if (status) team.status = status;
    
    // Update project details if provided
    if (project) {
      team.project = {
        ...team.project,
        ...project,
      };
    }

    await team.save();

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    );
  }
} 