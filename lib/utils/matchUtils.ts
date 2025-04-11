import { IUser } from '../models/User';
import { IUserMatch } from '../models/UserMatch';
import UserMatch from '../models/UserMatch';

// Role compatibility mapping - defines how well different roles work together
// Adjusted to create more variance between scores (range 40-95 instead of 60-90)
const roleCompatibilityMatrix: Record<string, Record<string, number>> = {
  'Developer': {
    'Developer': 60,
    'Designer': 90,
    'Project Manager': 80,
    'Researcher': 65,
    'Leader': 75,
    'Collaborator': 70,
  },
  'Designer': {
    'Developer': 90,
    'Designer': 55,
    'Project Manager': 75,
    'Researcher': 50,
    'Leader': 65,
    'Collaborator': 70,
  },
  'Project Manager': {
    'Developer': 80,
    'Designer': 75,
    'Project Manager': 45,
    'Researcher': 65,
    'Leader': 60,
    'Collaborator': 85,
  },
  'Researcher': {
    'Developer': 65,
    'Designer': 50,
    'Researcher': 70,
    'Project Manager': 65,
    'Leader': 70,
    'Collaborator': 75,
  },
  'Leader': {
    'Developer': 75,
    'Designer': 65,
    'Project Manager': 60,
    'Researcher': 70,
    'Leader': 40,
    'Collaborator': 95,
  },
  'Collaborator': {
    'Developer': 70,
    'Designer': 70,
    'Project Manager': 85,
    'Researcher': 75,
    'Leader': 95,
    'Collaborator': 55,
  },
};

// Default role compatibility if roles aren't found in the matrix
// Lowered to allow for more score variance
const DEFAULT_ROLE_COMPATIBILITY = 50;

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
 * Modified to create more variance in scores
 */
export function calculateSkillsCompatibility(user1: IUser, user2: IUser): number {
  const skills1 = user1.skills || [];
  const skills2 = user2.skills || [];

  if (skills1.length === 0 || skills2.length === 0) {
    return 30; // Lowered default score if either user has no skills
  }

  // Count common skills
  const commonSkills = skills1.filter(skill => skills2.includes(skill)).length;
  
  // Count unique skills that complement each other
  const uniqueSkills1 = skills1.filter(skill => !skills2.includes(skill)).length;
  const uniqueSkills2 = skills2.filter(skill => !skills1.includes(skill)).length;
  
  // Calculate commonality score (some overlap is good, but not too much)
  // Expand the range from 40-70 to 30-80
  const commonalityScore = commonSkills > 0 ? 30 + (commonSkills * 10) : 30;
  
  // Calculate complementary score (unique skills are valuable)
  // Expand the range from 60-90 to 40-100
  const complementaryScore = 40 + (Math.min(uniqueSkills1 + uniqueSkills2, 6) * 10);
  
  // Weighted average, valuing complementary skills more
  // Apply non-linear scaling to increase variance
  const rawScore = (commonalityScore * 0.35) + (complementaryScore * 0.65);
  return Math.min(100, Math.max(20, Math.round(rawScore)));
}

/**
 * Calculate availability compatibility between two users
 * Significantly increased benefit for "Flexible" availability
 */
export function calculateAvailabilityCompatibility(user1: IUser, user2: IUser): number {
  // Simple implementation based on text matching
  // In a real app, this would parse and compare actual schedules
  if (user1.availability === user2.availability) {
    return 100;
  }
  
  // Greatly increased score when either user is flexible (almost perfect match)
  if (user1.availability.includes('Flexible') || user2.availability.includes('Flexible')) {
    return 95;
  }
  
  // Check for partial overlaps in availability text
  const times = ['Morning', 'Afternoon', 'Evening', 'Weekend'];
  let overlapCount = 0;
  
  times.forEach(time => {
    if (user1.availability.includes(time) && user2.availability.includes(time)) {
      overlapCount++;
    }
  });
  
  // Score based on number of overlapping time periods
  // More variance: 0 overlaps = 30, 1 overlap = 55, 2 overlaps = 70, 3 overlaps = 85
  return overlapCount === 0 ? 30 : 40 + (overlapCount * 15);
}

/**
 * Calculate working style compatibility between two users
 * Modified to create more variance in scores
 */
export function calculateWorkingStyleCompatibility(user1: IUser, user2: IUser): number {
  if (!user1.workingStyle || !user2.workingStyle) {
    return 50; // Lowered default score if working style info is missing
  }
  
  // Calculate match for each working style attribute with increased variance
  const communicationMatch = user1.workingStyle.communication === user2.workingStyle.communication ? 100 : 
    (user1.workingStyle.communication === 'No preference' || user2.workingStyle.communication === 'No preference' ? 75 : 40);
  
  const workHoursMatch = user1.workingStyle.workHours === user2.workingStyle.workHours ? 100 : 
    (user1.workingStyle.workHours === 'Flexible' || user2.workingStyle.workHours === 'Flexible' ? 90 : 45);
  
  const teamSizeMatch = user1.workingStyle.teamSize === user2.workingStyle.teamSize ? 100 : 
    (user1.workingStyle.teamSize === 'Any' || user2.workingStyle.teamSize === 'Any' ? 80 : 50);
  
  const learningStyleMatch = user1.workingStyle.learningStyle === user2.workingStyle.learningStyle ? 100 : 
    (user1.workingStyle.learningStyle === 'Any' || user2.workingStyle.learningStyle === 'Any' ? 80 : 45);
  
  // Average of all style compatibility factors
  return Math.round((communicationMatch + workHoursMatch + teamSizeMatch + learningStyleMatch) / 4);
}

/**
 * Calculate overall compatibility score between two users
 * Modified to increase overall variance in scores
 */
export async function calculateCompatibilityScore(user1: IUser, user2: IUser): Promise<IUserMatch> {
  // Calculate individual compatibility factors
  const roleCompat = calculateRoleCompatibility(user1, user2);
  const skillsCompat = calculateSkillsCompatibility(user1, user2);
  const availabilityCompat = calculateAvailabilityCompatibility(user1, user2);
  const workingStyleCompat = calculateWorkingStyleCompatibility(user1, user2);
  
  // Weighted average for overall compatibility
  // Applying slight non-linear transformation to increase variance
  const rawScore = (roleCompat * 0.3) +
    (skillsCompat * 0.3) +
    (availabilityCompat * 0.2) +
    (workingStyleCompat * 0.2);
    
  // Apply non-linear transformation to increase score variance
  const normalizedScore = Math.pow(rawScore / 100, 1.2) * 100;
  const overallCompatibility = Math.round(Math.min(100, Math.max(0, normalizedScore)));
  
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
 * Modified to include ALL users, regardless of compatibility score
 */
export async function findCompatibleUsers(user: IUser, limit = 50): Promise<IUserMatch[]> {
  // No minimum threshold for compatibility scores - show all matches
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