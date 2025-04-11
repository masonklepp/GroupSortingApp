import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';

// Interface for Course Member
interface CourseMember {
  user: mongoose.Types.ObjectId | IUser;
  role: 'student' | 'instructor' | 'teaching_assistant';
  joinedAt: Date;
}

// Interface for Course document
export interface ICourse extends Document {
  name: string;
  courseCode: string;
  description: string;
  department: string;
  semester: string;
  members: CourseMember[];
  creator: mongoose.Types.ObjectId | IUser;
  maxTeamSize: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define Course schema
const CourseSchema = new Schema<ICourse>(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      trim: true,
    },
    members: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['student', 'instructor', 'teaching_assistant'],
          default: 'student',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    maxTeamSize: {
      type: Number,
      default: 4,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create the Course model or use existing one
export const Course: Model<ICourse> = 
  mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course; 