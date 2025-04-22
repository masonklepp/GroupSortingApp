import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { calculateCompatibilityScore } from '@/lib/utils/matchUtils';
import { getToken } from 'next-auth/jwt';

// POST endpoint to generate matches for all users
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Check if user is admin (or use session for regular users to regenerate their own matches)
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find all users
    const allUsers = await User.find();
    
    if (allUsers.length < 2) {
      return NextResponse.json(
        { error: 'Not enough users to create matches' },
        { status: 400 }
      );
    }

    // Track number of matches created
    let matchesCreated = 0;
    
    // Generate matches between all users
    // This is an O(n²) operation and should be optimized for large user bases
    for (let i = 0; i < allUsers.length; i++) {
      const user1 = allUsers[i];
      
      for (let j = i + 1; j < allUsers.length; j++) {
        const user2 = allUsers[j];
        
        // Skip matching users with themselves
        if (user1._id && user2._id && user1._id.toString() === user2._id.toString()) {
          continue;
        }
        
        // Calculate compatibility and create/update match
        const match = await calculateCompatibilityScore(user1, user2);
        matchesCreated++;
      }
    }
    
    return NextResponse.json({
      message: 'Matches generated successfully',
      totalUsers: allUsers.length,
      matchesCreated
    });
  } catch (error) {
    console.error('Error generating matches:', error);
    return NextResponse.json(
      { error: 'Failed to generate matches' },
      { status: 500 }
    );
  }
} 