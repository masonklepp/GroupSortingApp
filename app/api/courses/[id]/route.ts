import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Course } from '@/lib/models/Course';
import { User } from '@/lib/models/User';
import mongoose from 'mongoose';

// GET /api/courses/[id] - Get course by ID
export async function GET(
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
    
    await dbConnect();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: 'Invalid course ID' },
        { status: 400 }
      );
    }
    
    const course = await Course.findById(params.id)
      .populate('creator', 'name email')
      .populate('members.user', 'name email');
      
    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(course);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Update course details
export async function PUT(
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
    
    // Check if user is authorized (admin, instructor, or course creator)
    const isAdmin = user.role === 'admin';
    const isInstructor = user.role === 'instructor';
    const isCreator = course.creator.toString() === user._id.toString();
    
    if (!isAdmin && !isInstructor && !isCreator) {
      return NextResponse.json(
        { message: 'Not authorized to update this course' },
        { status: 403 }
      );
    }
    
    const data = await req.json();
    
    // Update allowable fields
    const updateFields = [
      'name', 'description', 'department', 'semester', 
      'maxTeamSize', 'isActive'
    ];
    
    const updateData: any = {};
    updateFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });
    
    const updatedCourse = await Course.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true }
    ).populate('creator', 'name email');
    
    return NextResponse.json(updatedCourse);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Delete a course
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
    
    // Only admin or the course creator can delete a course
    if (user.role !== 'admin' && course.creator.toString() !== user._id.toString()) {
      return NextResponse.json(
        { message: 'Not authorized to delete this course' },
        { status: 403 }
      );
    }
    
    await Course.findByIdAndDelete(params.id);
    
    return NextResponse.json(
      { message: 'Course deleted successfully' }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to delete course' },
      { status: 500 }
    );
  }
} 