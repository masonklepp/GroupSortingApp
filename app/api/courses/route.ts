import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Course } from '@/lib/models/Course';
import { User } from '@/lib/models/User';

// GET /api/courses - Fetch all courses
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const searchParams = req.nextUrl.searchParams;
    const query: any = {};
    
    // Apply filters if provided
    if (searchParams.has('department')) {
      query.department = searchParams.get('department');
    }
    
    if (searchParams.has('semester')) {
      query.semester = searchParams.get('semester');
    }
    
    if (searchParams.has('isActive')) {
      query.isActive = searchParams.get('isActive') === 'true';
    }
    
    await dbConnect();
    
    const courses = await Course.find(query)
      .populate('creator', 'name email')
      .select('-members.user')
      .sort({ createdAt: -1 });
      
    return NextResponse.json(courses);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create a new course
export async function POST(req: NextRequest) {
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
    
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Only admins and instructors can create courses
    if (!['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json(
        { message: 'Only administrators and instructors can create courses' },
        { status: 403 }
      );
    }
    
    const data = await req.json();
    
    // Validate required fields
    const requiredFields = ['name', 'courseCode', 'description', 'department', 'semester'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Check if course with same code already exists
    const existingCourse = await Course.findOne({ courseCode: data.courseCode });
    if (existingCourse) {
      return NextResponse.json(
        { message: 'A course with this code already exists' },
        { status: 409 }
      );
    }
    
    // Create course with creator as the first member (as instructor)
    const newCourse = await Course.create({
      ...data,
      creator: user._id,
      members: [
        {
          user: user._id,
          role: 'instructor',
          joinedAt: new Date(),
        },
      ],
    });
    
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to create course' },
      { status: 500 }
    );
  }
} 