import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Course } from '@/lib/models/Course';
import { User } from '@/lib/models/User';
import mongoose from 'mongoose';

// POST /api/courses/[id]/members - Join a course
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const userEmail = session.user?.email;
    if (!userEmail) {
      return NextResponse.json(
        { message: 'User email not found in session' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: 'Invalid course ID' },
        { status: 400 }
      );
    }
    
    const course = await Course.findById(params.id);
    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Check if course is active
    if (!course.isActive) {
      return NextResponse.json(
        { message: 'Cannot join an inactive course' },
        { status: 400 }
      );
    }
    
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if user is already a member
    const isMember = course.members.some(
      (member: any) => member.user.toString() === user._id.toString()
    );
    
    if (isMember) {
      return NextResponse.json(
        { message: 'Already a member of this course' },
        { status: 400 }
      );
    }
    
    // Add user to course members
    course.members.push({
      user: user._id,
      joinedAt: new Date(),
      role: user.role === 'instructor' ? 'instructor' : 'student'
    });
    
    await course.save();
    
    return NextResponse.json(
      { message: 'Successfully joined the course' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to join course' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id]/members - Leave a course
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const userEmail = session.user?.email;
    if (!userEmail) {
      return NextResponse.json(
        { message: 'User email not found in session' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: 'Invalid course ID' },
        { status: 400 }
      );
    }
    
    const course = await Course.findById(params.id);
    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }
    
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the course creator
    if (course.creator.toString() === user._id.toString()) {
      return NextResponse.json(
        { message: 'Course creator cannot leave the course' },
        { status: 400 }
      );
    }
    
    // Check if user is a member
    const memberIndex = course.members.findIndex(
      (member: any) => member.user.toString() === user._id.toString()
    );
    
    if (memberIndex === -1) {
      return NextResponse.json(
        { message: 'Not a member of this course' },
        { status: 400 }
      );
    }
    
    // Remove user from course members
    course.members.splice(memberIndex, 1);
    await course.save();
    
    return NextResponse.json(
      { message: 'Successfully left the course' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to leave course' },
      { status: 500 }
    );
  }
} 