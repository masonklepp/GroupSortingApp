import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getServerSession } from 'next-auth/next';
import { calculateCompatibilityScore } from '@/lib/utils/matchUtils';
import { authOptions } from '@/lib/auth';

// Get current user profile
export async function GET(req: NextRequest) {
  try {
    // Get session user ID
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Find user by email
    const user = await User.findOne({ email: session.user.email })
      .select('-password'); // Exclude password field

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// Update user profile
export async function PATCH(req: NextRequest) {
  try {
    // Get session user ID
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get profile update data
    const updateData = await req.json();
    
    // Fields that cannot be updated directly
    const protectedFields = ['email', 'password'];
    
    // Remove protected fields from update data
    protectedFields.forEach(field => {
      if (field in updateData) {
        delete updateData[field];
      }
    });

    // Find and update user
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If profile skills, role, or availability changed, recalculate compatibility
    if (updateData.skills || updateData.role || updateData.availability || updateData.workingStyle) {
      // Find all other users
      const otherUsers = await User.find({ _id: { $ne: updatedUser._id } });
      
      // Recalculate compatibility with each user
      const compatibilityPromises = otherUsers.map(otherUser => 
        calculateCompatibilityScore(updatedUser, otherUser)
      );
      
      // Wait for all compatibility calculations to complete
      await Promise.all(compatibilityPromises);
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 