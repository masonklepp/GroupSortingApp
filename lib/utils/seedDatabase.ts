import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import Team from '@/lib/models/Team';
import Invitation from '@/lib/models/Invitation';
import { calculateCompatibilityScore } from '@/lib/utils/matchUtils';

// Example user data
const userData = [
  {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    image: '/placeholder.svg?height=40&width=40',
    role: 'Leader',
    skills: ['Leadership', 'Project Management', 'Communication'],
    availability: 'Afternoons, Evenings',
    bio: 'Experienced team leader with a passion for organizing projects and helping team members succeed.',
    workingStyle: {
      communication: 'Video calls',
      workHours: 'Afternoons and evenings',
      teamSize: '3-5 people',
      learningStyle: 'Visual',
    }
  },
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    image: '/placeholder.svg?height=40&width=40',
    role: 'Developer',
    skills: ['Programming', 'Research', 'Problem Solving'],
    availability: 'Evenings, Weekends',
    bio: 'Full-stack developer with expertise in React, Node.js, and MongoDB.',
    workingStyle: {
      communication: 'Chat and messages',
      workHours: 'Evenings and weekends',
      teamSize: '3-5 people',
      learningStyle: 'Hands-on',
    }
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    image: '/placeholder.svg?height=40&width=40',
    role: 'Designer',
    skills: ['Communication', 'Design', 'Presentation'],
    availability: 'Mornings, Afternoons',
    bio: 'UI/UX designer with a focus on creating intuitive and beautiful user experiences.',
    workingStyle: {
      communication: 'Video calls',
      workHours: 'Mornings and afternoons',
      teamSize: '2-4 people',
      learningStyle: 'Visual',
    }
  },
  {
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    image: '/placeholder.svg?height=40&width=40',
    role: 'Researcher',
    skills: ['Research', 'Data Analysis', 'Writing'],
    availability: 'Flexible',
    bio: 'Thorough researcher with expertise in data analysis and report writing.',
    workingStyle: {
      communication: 'Email and documents',
      workHours: 'Flexible',
      teamSize: 'Any',
      learningStyle: 'Reading',
    }
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    image: '/placeholder.svg?height=40&width=40',
    role: 'Developer',
    skills: ['Programming', 'Mobile Development', 'Testing'],
    availability: 'Afternoons only',
    bio: 'Mobile app developer specializing in iOS and Android development.',
    workingStyle: {
      communication: 'Chat',
      workHours: 'Afternoons',
      teamSize: '2-3 people',
      learningStyle: 'Hands-on',
    }
  },
];

/**
 * Seeds the database with initial data
 */
export async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected to database.');

    // Clear existing data (optional, remove in production)
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Team.deleteMany({});
    await Invitation.deleteMany({});
    console.log('Existing data cleared.');

    // Create users
    console.log('Creating users...');
    const createdUsers = await User.insertMany(userData);
    console.log(`Created ${createdUsers.length} users.`);

    // Calculate compatibility scores between all users
    console.log('Calculating compatibility scores...');
    for (let i = 0; i < createdUsers.length; i++) {
      for (let j = i + 1; j < createdUsers.length; j++) {
        await calculateCompatibilityScore(createdUsers[i], createdUsers[j]);
        console.log(`Calculated compatibility between ${createdUsers[i].name} and ${createdUsers[j].name}`);
      }
    }
    console.log('All compatibility scores calculated.');

    // Create a sample team
    console.log('Creating sample team...');
    const sampleTeam = await Team.create({
      name: 'Project Alpha',
      description: 'Web Development Project',
      status: 'Active',
      creator: createdUsers[0]._id, // Jane Doe as creator
      members: [
        {
          user: createdUsers[0]._id, // Jane Doe
          role: 'Team Lead',
          joinedAt: new Date(),
        },
        {
          user: createdUsers[1]._id, // John Smith
          role: 'Frontend Developer',
          joinedAt: new Date(),
        },
        {
          user: createdUsers[2]._id, // Sarah Johnson
          role: 'UI/UX Designer',
          joinedAt: new Date(),
        },
      ],
      project: {
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)), // 3 months from now
        progress: '30%',
        nextMeeting: new Date(new Date().setDate(new Date().getDate() + 7)), // 1 week from now
      },
    });
    console.log(`Created team: ${sampleTeam.name}`);

    // Create a sample invitation
    console.log('Creating sample invitation...');
    const sampleInvitation = await Invitation.create({
      sender: createdUsers[0]._id, // Jane Doe
      recipient: createdUsers[3]._id, // Michael Brown
      team: sampleTeam._id,
      status: 'pending',
      message: 'We would love to have your research skills on our team!',
    });
    console.log(`Created invitation from ${createdUsers[0].name} to ${createdUsers[3].name}`);

    console.log('Database seeding completed successfully!');
    return {
      users: createdUsers,
      teams: [sampleTeam],
      invitations: [sampleInvitation],
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

export default seedDatabase; 