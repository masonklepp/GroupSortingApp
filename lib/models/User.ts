import mongoose, { Schema, Document, Model } from 'mongoose';
import { hash } from 'bcrypt';

// Interface for User document
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: string;
  skills: string[];
  availability: string;
  bio?: string;
  workingStyle?: {
    communication: string;
    workHours: string;
    teamSize: string;
    learningStyle: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Define User schema
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: [6, 'Password should be at least 6 characters long'],
    },
    image: {
      type: String,
      default: '/placeholder.svg?height=40&width=40',
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    availability: {
      type: String,
      default: 'Flexible',
    },
    bio: {
      type: String,
      trim: true,
    },
    workingStyle: {
      communication: {
        type: String,
        default: 'No preference',
      },
      workHours: {
        type: String,
        default: 'Flexible',
      },
      teamSize: {
        type: String,
        default: 'Any',
      },
      learningStyle: {
        type: String,
        default: 'Any',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with bcrypt
    if (this.password) {
      this.password = await hash(this.password, 10);
    }
    next();
  } catch (error: any) {
    next(error);
  }
});

// Create the User model or use existing one to prevent overwriting
export const User: Model<IUser> = 
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User; 