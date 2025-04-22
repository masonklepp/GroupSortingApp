import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { calculateCompatibilityScore } from '@/lib/utils/matchUtils';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, skills = [], availability = 'Flexible', bio } = await req.json();
    
    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role,
      skills,
      availability,
      bio,
      // Generate avatar from name initials if no image provided
      image: `/api/avatar?name=${encodeURIComponent(name)}`,
      workingStyle: {
        communication: 'No preference',
        workHours: 'Flexible',
        teamSize: 'Any',
        learningStyle: 'Any',
      },
    });

    // Generate matches with existing users
    try {
      // Find all other users
      const otherUsers = await User.find({ _id: { $ne: user._id } });
      
      // Calculate compatibility with each user
      const compatibilityPromises = otherUsers.map(otherUser => 
        calculateCompatibilityScore(user, otherUser)
      );
      
      // Wait for all compatibility calculations to complete
      await Promise.all(compatibilityPromises);
    } catch (matchError) {
      console.error('Error generating initial matches:', matchError);
      // Continue with registration even if match generation fails
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(
      { message: 'User registered successfully', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
} 