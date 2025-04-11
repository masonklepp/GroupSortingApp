import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';
import { ITeam } from './Team';

// Interface for Invitation document
export interface IInvitation extends Document {
  sender: mongoose.Types.ObjectId | IUser;
  recipient: mongoose.Types.ObjectId | IUser;
  team: mongoose.Types.ObjectId | ITeam;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define Invitation schema
const InvitationSchema = new Schema<IInvitation>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
    message: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create the Invitation model or use existing one
export const Invitation: Model<IInvitation> = 
  mongoose.models.Invitation || mongoose.model<IInvitation>('Invitation', InvitationSchema);

export default Invitation; 