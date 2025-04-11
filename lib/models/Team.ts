import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';

// Interface for Team Member
interface TeamMember {
  user: mongoose.Types.ObjectId | IUser;
  role: string;
  joinedAt: Date;
}

// Interface for Project
interface Project {
  deadline?: Date;
  progress: string;
  nextMeeting?: Date;
}

// Interface for Team document
export interface ITeam extends Document {
  name: string;
  description: string;
  status: 'Active' | 'Completed' | 'Archived';
  members: TeamMember[];
  creator: mongoose.Types.ObjectId | IUser;
  project?: Project;
  createdAt: Date;
  updatedAt: Date;
}

// Define Team schema
const TeamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Archived'],
      default: 'Active',
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
          required: true,
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
    project: {
      deadline: {
        type: Date,
      },
      progress: {
        type: String,
        default: '0%',
      },
      nextMeeting: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create the Team model or use existing one
export const Team: Model<ITeam> = 
  mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema);

export default Team; 