import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getToken } from 'next-auth/jwt';

// Get users (with optional filtering) - admin access required
export async function GET(req: NextRequest) {
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

    const searchParams = req.nextUrl.searchParams;
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const userId = searchParams.get('userId');

    // If specific userId is requested, return just that user
    if (userId) {
      const user = await User.findById(userId)
        .select('name email image role skills availability');
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(user);
    }

    // Build query filters
    const query: any = {};
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } }, // Case-insensitive name search
        { skills: { $elemMatch: { $regex: search, $options: 'i' } } }, // Search in skills array
      ];
    }

    // Fetch users with filters
    const users = await User.find(query)
      .select('name email image role skills availability')
      .limit(limit);

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// Create a new user
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const userData = await req.json();
    
    // Check for required fields
    if (!userData.name || !userData.email || !userData.role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create the user
    const user = await User.create(userData);

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// Update a user
export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();

    const { userId, ...updateData } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Don't allow updating email to an existing email
    if (updateData.email) {
      const existingUser = await User.findOne({ 
        email: updateData.email,
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email is already in use' },
          { status: 409 }
        );
      }
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
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