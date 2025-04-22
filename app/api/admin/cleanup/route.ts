import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import UserMatch from '@/lib/models/UserMatch';
import { getToken } from 'next-auth/jwt';

// POST endpoint to clean up orphaned matches
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    // Get the auth token to verify if the requester is an admin
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET
    });

    // Check if user is admin
    if (!token || token.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Find all user IDs
    const users = await User.find().select('_id');
    const userIds = users.map(user => user._id.toString());

    // Find and delete matches where either user1 or user2 doesn't exist anymore
    const deleteResult = await UserMatch.deleteMany({
      $or: [
        { user1: { $nin: userIds } },
        { user2: { $nin: userIds } }
      ]
    });

    return NextResponse.json({
      message: 'Cleanup completed successfully',
      deletedMatches: deleteResult.deletedCount
    });
  } catch (error) {
    console.error('Error cleaning up matches:', error);
    return NextResponse.json(
      { error: 'Failed to clean up matches' },
      { status: 500 }
    );
  }
} 