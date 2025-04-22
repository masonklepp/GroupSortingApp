import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import UserMatch from '@/lib/models/UserMatch';
import { getToken } from 'next-auth/jwt';

// Get a single user by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const user = await User.findById(params.id)
      .select('name email image role skills availability workingStyle');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// Update a user by ID
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const updateData = await req.json();
    
    // Don't allow updating email to an existing email
    if (updateData.email) {
      const existingUser = await User.findOne({ 
        email: updateData.email,
        _id: { $ne: params.id }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email is already in use' },
          { status: 409 }
        );
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// Delete a user by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    // Get the auth token to verify if the requester is an admin
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET
    });

    // Check if user is admin (only admins can delete users)
    if (!token || token.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }
    
    // Find the user to delete
    const user = await User.findById(params.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // First, delete any matches associated with this user
    await UserMatch.deleteMany({
      $or: [
        { user1: params.id },
        { user2: params.id }
      ]
    });
    
    // Next, delete the user
    await User.findByIdAndDelete(params.id);
    
    return NextResponse.json(
      { message: 'User and associated matches deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 