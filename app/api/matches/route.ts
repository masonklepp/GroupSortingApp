import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import UserMatch from '@/lib/models/UserMatch';
import { findCompatibleUsers, calculateCompatibilityScore } from '@/lib/utils/matchUtils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Get matches for current user
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get the current user from the session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Find the current user ID
    const currentUser = await User.findOne({ email: session.user.email });
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find all matches for this user
    const matches = await UserMatch.find({
      $or: [
        { user1: currentUser._id },
        { user2: currentUser._id }
      ]
    })
    .sort({ compatibilityScore: -1 })
    .populate('user1', 'name email image role skills availability workingStyle')
    .populate('user2', 'name email image role skills availability workingStyle');
    
    // Format the results to return the other user in each match
    const formattedMatches = matches.map(match => {
      const isUser1 = match.user1._id.toString() === currentUser._id.toString();
      const otherUser = isUser1 ? match.user2 : match.user1;
      
      return {
        matchId: match._id,
        compatibilityScore: match.compatibilityScore,
        matchFactors: match.matchFactors,
        user: {
          id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          image: otherUser.image,
          role: otherUser.role,
          skills: otherUser.skills,
          availability: otherUser.availability,
          workingStyle: otherUser.workingStyle
        }
      };
    });
    
    return NextResponse.json(formattedMatches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

// This endpoint would be used to manually recalculate compatibility between users
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find all other users
    const otherUsers = await User.find({ _id: { $ne: userId } });
    
    // Calculate compatibility with each user
    // This would be computationally expensive for large user bases
    // In production, this should be done via a background job
    for (const otherUser of otherUsers) {
      await calculateCompatibilityScore(user, otherUser);
    }
    
    return NextResponse.json({ message: 'Compatibility scores recalculated' });
  } catch (error) {
    console.error('Error recalculating matches:', error);
    return NextResponse.json(
      { error: 'Failed to recalculate matches' },
      { status: 500 }
    );
  }
} 