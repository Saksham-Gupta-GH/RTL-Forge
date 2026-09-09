import mongoose, { Schema, Document } from 'mongoose';
import { Project } from '../domain/types';

const projectSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  circuit: { type: Schema.Types.Mixed, required: true },
  componentDefinitions: { type: [Schema.Types.Mixed], default: [] },
  simulationSettings: { type: Schema.Types.Mixed, default: { clockSpeedHz: 1 } },
  testbenches: { type: [Schema.Types.Mixed], default: [] },
  isPublic: { type: Boolean, default: false },
  shareToken: { type: String },
  ownerSessionId: { type: String }, // For basic session-based ownership
}, { timestamps: true });

// Prevent mongoose from recompiling the model upon hot reload
export const ProjectModel = mongoose.models.Project || mongoose.model('Project', projectSchema);

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true }, // Simple plain text for MVP as requested, ideally hashed
}, { timestamps: true });

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
