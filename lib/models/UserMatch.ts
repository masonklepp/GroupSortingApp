import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';

// Interface for UserMatch document
export interface IUserMatch extends Document {
  user1: mongoose.Types.ObjectId | IUser;
  user2: mongoose.Types.ObjectId | IUser;
  compatibilityScore: number;
  matchFactors: {
    roleCompat: number;
    skillsCompat: number;
    availabilityCompat: number;
    workingStyleCompat: number;
  };
  calculatedAt: Date;
}

// Define UserMatch schema
const UserMatchSchema = new Schema<IUserMatch>(
  {
    user1: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user2: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    compatibilityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    matchFactors: {
      roleCompat: {
        type: Number,
        default: 0,
      },
      skillsCompat: {
        type: Number,
        default: 0,
      },
      availabilityCompat: {
        type: Number,
        default: 0,
      },
      workingStyleCompat: {
        type: Number,
        default: 0,
      },
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
  }
);

// Ensure unique pairings (only one match document per pair of users)
UserMatchSchema.index({ user1: 1, user2: 1 }, { unique: true });

// Create the UserMatch model or use existing one
export const UserMatch: Model<IUserMatch> = 
  mongoose.models.UserMatch || mongoose.model<IUserMatch>('UserMatch', UserMatchSchema);

export default UserMatch; 