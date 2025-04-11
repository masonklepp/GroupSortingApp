import { IUser } from '../models/User';
import { IUserMatch } from '../models/UserMatch';
import UserMatch from '../models/UserMatch';

// Role compatibility mapping - defines how well different roles work together
const roleCompatibilityMatrix: Record<string, Record<string, number>> = {
  'Developer': {
    'Developer': 70,
    'Designer': 85,
    'Project Manager': 80,
    'Researcher': 75,
    'Leader': 80,
    'Collaborator': 75,
  },
  'Designer': {
    'Developer': 85,
    'Designer': 70,
    'Project Manager': 80,
    'Researcher': 65,
    'Leader': 70,
    'Collaborator': 75,
  },
  'Project Manager': {
    'Developer': 80,
    'Designer': 80,
    'Project Manager': 60,
    'Researcher': 75,
    'Leader': 65,
    'Collaborator': 85,
  },
  'Researcher': {
    'Developer': 75,
    'Designer': 65,
    'Project Manager': 75,
    'Researcher': 80,
    'Leader': 75,
    'Collaborator': 80,
  },
  'Leader': {
    'Developer': 80,
    'Designer': 70,
    'Project Manager': 65,
    'Researcher': 75,
    'Leader': 60,
    'Collaborator': 90,
  },
  'Collaborator': {
    'Developer': 75,
    'Designer': 75,
    'Project Manager': 85,
    'Researcher': 80,
    'Leader': 90,
    'Collaborator': 70,
  },
};

// Default role compatibility if roles aren't found in the matrix
const DEFAULT_ROLE_COMPATIBILITY = 70;

/**
 * Calculate role compatibility between two users
 */
export function calculateRoleCompatibility(user1: IUser, user2: IUser): number {
  const role1 = user1.role;
  const role2 = user2.role;

  // Check if both roles exist in the matrix
  if (roleCompatibilityMatrix[role1] && roleCompatibilityMatrix[role1][role2] !== undefined) {
    return roleCompatibilityMatrix[role1][role2];
  }

  // Return default compatibility if not found
  return DEFAULT_ROLE_COMPATIBILITY;
}

/**
 * Calculate skills compatibility between two users
 * Higher score for complementary skills rather than identical skills
 */
export function calculateSkillsCompatibility(user1: IUser, user2: IUser): number {
  const skills1 = user1.skills || [];
  const skills2 = user2.skills || [];

  if (skills1.length === 0 || skills2.length === 0) {
    return 50; // Default score if either user has no skills
  }

  // Count common skills
  const commonSkills = skills1.filter(skill => skills2.includes(skill)).length;
  
  // Count unique skills that complement each other
  const uniqueSkills1 = skills1.filter(skill => !skills2.includes(skill)).length;
  const uniqueSkills2 = skills2.filter(skill => !skills1.includes(skill)).length;
  
  // Calculate commonality score (some overlap is good, but not too much)
  const commonalityScore = commonSkills > 0 ? 70 : 40;
  
  // Calculate complementary score (unique skills are valuable)
  const complementaryScore = (uniqueSkills1 + uniqueSkills2) > 0 ? 90 : 60;
  
  // Weighted average, valuing complementary skills more
  return Math.round((commonalityScore * 0.4) + (complementaryScore * 0.6));
}

/**
 * Calculate availability compatibility between two users
 */
export function calculateAvailabilityCompatibility(user1: IUser, user2: IUser): number {
  // Simple implementation based on text matching
  // In a real app, this would parse and compare actual schedules
  if (user1.availability === user2.availability) {
    return 100;
  }
  
  if (user1.availability.includes('Flexible') || user2.availability.includes('Flexible')) {
    return 90;
  }
  
  // Check for partial overlaps in availability text
  const times = ['Morning', 'Afternoon', 'Evening', 'Weekend'];
  const overlap = times.some(time => 
    user1.availability.includes(time) && user2.availability.includes(time)
  );
  
  return overlap ? 80 : 50;
}

/**
 * Calculate working style compatibility between two users
 */
export function calculateWorkingStyleCompatibility(user1: IUser, user2: IUser): number {
  if (!user1.workingStyle || !user2.workingStyle) {
    return 70; // Default score if working style info is missing
  }
  
  // Calculate match for each working style attribute
  const communicationMatch = user1.workingStyle.communication === user2.workingStyle.communication ? 100 : 
    (user1.workingStyle.communication === 'No preference' || user2.workingStyle.communication === 'No preference' ? 80 : 60);
  
  const workHoursMatch = user1.workingStyle.workHours === user2.workingStyle.workHours ? 100 : 
    (user1.workingStyle.workHours === 'Flexible' || user2.workingStyle.workHours === 'Flexible' ? 85 : 60);
  
  const teamSizeMatch = user1.workingStyle.teamSize === user2.workingStyle.teamSize ? 100 : 
    (user1.workingStyle.teamSize === 'Any' || user2.workingStyle.teamSize === 'Any' ? 90 : 70);
  
  const learningStyleMatch = user1.workingStyle.learningStyle === user2.workingStyle.learningStyle ? 100 : 
    (user1.workingStyle.learningStyle === 'Any' || user2.workingStyle.learningStyle === 'Any' ? 90 : 75);
  
  // Average of all style compatibility factors
  return Math.round((communicationMatch + workHoursMatch + teamSizeMatch + learningStyleMatch) / 4);
}

/**
 * Calculate overall compatibility score between two users
 */
export async function calculateCompatibilityScore(user1: IUser, user2: IUser): Promise<IUserMatch> {
  // Calculate individual compatibility factors
  const roleCompat = calculateRoleCompatibility(user1, user2);
  const skillsCompat = calculateSkillsCompatibility(user1, user2);
  const availabilityCompat = calculateAvailabilityCompatibility(user1, user2);
  const workingStyleCompat = calculateWorkingStyleCompatibility(user1, user2);
  
  // Weighted average for overall compatibility
  const overallCompatibility = Math.round(
    (roleCompat * 0.3) +
    (skillsCompat * 0.3) +
    (availabilityCompat * 0.2) +
    (workingStyleCompat * 0.2)
  );
  
  // Create or update the match record
  const matchData = {
    user1: user1._id,
    user2: user2._id,
    compatibilityScore: overallCompatibility,
    matchFactors: {
      roleCompat,
      skillsCompat,
      availabilityCompat,
      workingStyleCompat,
    },
    calculatedAt: new Date(),
  };
  
  // Find existing match or create a new one
  const existingMatch = await UserMatch.findOne({
    $or: [
      { user1: user1._id, user2: user2._id },
      { user1: user2._id, user2: user1._id }
    ]
  });
  
  if (existingMatch) {
    // Update existing match
    Object.assign(existingMatch, matchData);
    await existingMatch.save();
    return existingMatch;
  } else {
    // Create new match
    return await UserMatch.create(matchData);
  }
}

/**
 * Find the most compatible users for a given user
 */
export async function findCompatibleUsers(user: IUser, limit = 10): Promise<IUserMatch[]> {
  const matches = await UserMatch.find({
    $or: [
      { user1: user._id },
      { user2: user._id }
    ]
  })
  .sort({ compatibilityScore: -1 })
  .limit(limit)
  .populate('user1')
  .populate('user2');
  
  return matches;
}

export default {
  calculateCompatibilityScore,
  findCompatibleUsers,
}; 