import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Invitation from '@/lib/models/Invitation';
import Team from '@/lib/models/Team';
import User from '@/lib/models/User';

// Get invitations for a user
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching invitations for user ID: ${userId}`);

    // Find invitations where the user is either sender or recipient
    // We need to handle both ObjectId and string formats since IDs might be stored differently
    // across different parts of the application
    const invitations = await Invitation.find({
      $or: [
        { sender: userId },
        { recipient: userId },
      ],
    })
      .populate({
        path: 'sender', 
        select: 'name image', 
        model: User
      })
      .populate({
        path: 'recipient', 
        select: 'name image', 
        model: User
      })
      .populate({
        path: 'team',
        select: 'name description members',
        model: Team
      });

    console.log(`Found ${invitations.length} invitations`);
    
    // Make sure to fully populate the data and return clean objects
    const populatedInvitations = invitations.map(invitation => {
      const invitationObj = invitation.toObject();
      
      // Ensure sender and recipient are properly formatted with IDs
      if (invitationObj.sender) {
        invitationObj.sender._id = invitationObj.sender._id.toString();
      }
      
      if (invitationObj.recipient) {
        invitationObj.recipient._id = invitationObj.recipient._id.toString();
      }
      
      if (invitationObj.team) {
        invitationObj.team._id = invitationObj.team._id.toString();
      }
      
      // Convert _id to string format
      invitationObj._id = invitationObj._id.toString();
      
      return invitationObj;
    });

    return NextResponse.json(populatedInvitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}

// Create a new invitation
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    let { senderId, recipientId, teamId, message } = await req.json();
    
    console.log('Invitation request data:', { senderId, recipientId, teamId, message });

    // If senderId is not provided, get it from the session
    if (!senderId) {
      const session = await fetch(new URL('/api/auth/session', req.url)).then(res => res.json());
      console.log('Session data:', session);
      
      if (session && session.user && session.user.id) {
        senderId = session.user.id;
        console.log('Using sender ID from session:', senderId);
      } else {
        return NextResponse.json(
          { error: 'Unable to determine sender ID. Please try again.' },
          { status: 401 }
        );
      }
    }

    // Validate required fields
    if (!recipientId || !teamId) {
      return NextResponse.json(
        { error: 'Recipient ID and team ID are required' },
        { status: 400 }
      );
    }

    console.log('Looking up users and team', { senderId, recipientId, teamId });
    
    // Find sender user by ID
    const sender = await User.findById(senderId).catch(() => null);
    if (!sender) {
      // Try finding by string _id
      console.log('Trying to find sender with string ID:', senderId);
      try {
        // Use a more flexible query to find the user
        const altSender = await User.findOne({ 
          $or: [
            { _id: senderId },
            { 'email': senderId }
          ]
        });
        
        if (!altSender) {
          console.log('Sender not found with alternate methods');
          return NextResponse.json(
            { error: 'Sender not found. Please check your account.' },
            { status: 404 }
          );
        }
        
        console.log('Sender found with alternate method:', altSender._id);
        // Update senderId to the proper ID format
        senderId = altSender._id;
      } catch (findError) {
        console.error('Error finding sender:', findError);
        return NextResponse.json(
          { error: 'Sender not found. Please check your account.' },
          { status: 404 }
        );
      }
    }

    // Find recipient user by ID  
    const recipient = await User.findById(recipientId).catch(() => null);
    if (!recipient) {
      // Try finding by string _id
      console.log('Trying to find recipient with string ID:', recipientId);
      try {
        // Use a more flexible query to find the user
        const altRecipient = await User.findOne({ 
          $or: [
            { _id: recipientId },
            { 'email': recipientId }
          ]
        });
        
        if (!altRecipient) {
          console.log('Recipient not found with alternate methods');
          return NextResponse.json(
            { error: 'Recipient not found. User may have been deleted.' },
            { status: 404 }
          );
        }
        
        console.log('Recipient found with alternate method:', altRecipient._id);
        // Update recipientId to the proper ID format
        recipientId = altRecipient._id;
      } catch (findError) {
        console.error('Error finding recipient:', findError);
        return NextResponse.json(
          { error: 'Recipient not found. User may have been deleted.' },
          { status: 404 }
        );
      }
    }

    // Find team by ID
    const team = await Team.findById(teamId).catch(() => null);
    if (!team) {
      // Try finding by string _id
      console.log('Trying to find team with string ID:', teamId);
      try {
        const altTeam = await Team.findOne({ 
          $or: [
            { _id: teamId },
            { 'name': teamId }
          ]
        });
        
        if (!altTeam) {
          console.log('Team not found with alternate methods');
          return NextResponse.json(
            { error: 'Team not found. It may have been deleted.' },
            { status: 404 }
          );
        }
        
        console.log('Team found with alternate method:', altTeam._id);
        // Update teamId to the proper ID format
        teamId = altTeam._id;
      } catch (findError) {
        console.error('Error finding team:', findError);
        return NextResponse.json(
          { error: 'Team not found. It may have been deleted.' },
          { status: 404 }
        );
      }
    }

    console.log('Found sender, recipient, and team');
    
    // Check if the recipient is already a member of the team
    let isAlreadyMember = false;

    // Convert recipient ID to string for comparison
    const recipientIdStr = recipientId.toString();

    // Check team members array
    if (team.members && Array.isArray(team.members)) {
      console.log(`Checking ${team.members.length} team members for recipient ID ${recipientIdStr}`);
      
      for (const member of team.members) {
        // Handle different ways the user ID might be stored
        let memberId = '';
        
        if (member.user) {
          // If it's an object with _id
          if (typeof member.user === 'object' && member.user._id) {
            memberId = member.user._id.toString();
          } 
          // If it's already a string or ObjectId
          else {
            memberId = member.user.toString();
          }
        }
        
        console.log(`Comparing member ID ${memberId} with recipient ID ${recipientIdStr}`);
        
        if (memberId === recipientIdStr) {
          isAlreadyMember = true;
          break;
        }
      }
    }

    if (isAlreadyMember) {
      console.log('User is already a team member');
      return NextResponse.json(
        { error: 'This user is already a member of the team' },
        { status: 409 }
      );
    }

    // Check if an invitation already exists - use IDs as strings for consistent comparison
    console.log('Checking for existing invitation');
    const existingInvitation = await Invitation.findOne({
      $and: [
        { $or: [
          { sender: senderId },
          { sender: senderId.toString() }
        ]},
        { $or: [
          { recipient: recipientId },
          { recipient: recipientId.toString() }
        ]},
        { $or: [
          { team: teamId },
          { team: teamId.toString() }
        ]},
        { status: 'pending' }
      ]
    });

    if (existingInvitation) {
      console.log('Invitation already exists:', existingInvitation._id);
      return NextResponse.json(
        { error: 'An invitation already exists for this user and team' },
        { status: 409 }
      );
    }

    // Create the invitation
    console.log('Creating new invitation with validated IDs:', {
      sender: senderId,
      recipient: recipientId,
      team: teamId
    });

    try {
      const invitation = new Invitation({
        sender: senderId,
        recipient: recipientId,
        team: teamId,
        message: message || 'You have been invited to join our team.',
        status: 'pending',
      });
      
      await invitation.save();
      console.log('Invitation created successfully:', invitation._id);

      // Return the created invitation with populated fields
      const populatedInvitation = await Invitation.findById(invitation._id)
        .populate('sender', 'name image')
        .populate('recipient', 'name image')
        .populate('team', 'name description');

      if (!populatedInvitation) {
        console.error('Failed to retrieve populated invitation');
        return NextResponse.json(
          { error: 'Invitation created but failed to retrieve details' },
          { status: 500 }
        );
      }

      // Convert to plain object and clean up IDs
      const invitationObj = populatedInvitation.toObject();
      
      // Convert ObjectId to string for all IDs
      if (invitationObj._id) invitationObj._id = invitationObj._id.toString();
      if (invitationObj.sender?._id) invitationObj.sender._id = invitationObj.sender._id.toString();
      if (invitationObj.recipient?._id) invitationObj.recipient._id = invitationObj.recipient._id.toString();
      if (invitationObj.team?._id) invitationObj.team._id = invitationObj.team._id.toString();
      
      return NextResponse.json(invitationObj, { status: 201 });
    } catch (createError) {
      console.error('Error creating invitation:', createError);
      return NextResponse.json(
        { error: 'Failed to create invitation: ' + createError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
}

// Update invitation status (accept/decline)
export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();

    const { invitationId, status } = await req.json();

    if (!invitationId || !status) {
      return NextResponse.json(
        { error: 'Invitation ID and status are required' },
        { status: 400 }
      );
    }

    if (!['accepted', 'declined'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either "accepted" or "declined"' },
        { status: 400 }
      );
    }

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Invitation has already been processed' },
        { status: 400 }
      );
    }

    // Update invitation status
    invitation.status = status;
    await invitation.save();

    // If accepted, add the user to the team
    if (status === 'accepted') {
      const team = await Team.findById(invitation.team);
      
      if (!team) {
        return NextResponse.json(
          { error: 'Team not found' },
          { status: 404 }
        );
      }

      const user = await User.findById(invitation.recipient);
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Check if user is already a member
      const isAlreadyMember = team.members.some(
        member => member.user.toString() === invitation.recipient.toString()
      );

      if (!isAlreadyMember) {
        // Add user to team members
        team.members.push({
          user: invitation.recipient,
          role: user.role, // Use the user's primary role
          joinedAt: new Date(),
        });

        await team.save();
      }
    }

    return NextResponse.json(invitation);
  } catch (error) {
    console.error('Error updating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to update invitation' },
      { status: 500 }
    );
  }
} 