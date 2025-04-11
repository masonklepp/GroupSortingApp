import { NextRequest, NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/utils/seedDatabase';

// This endpoint should only be accessible in development
export async function POST(req: NextRequest) {
  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development mode' },
        { status: 403 }
      );
    }

    // Get authorization key from request
    const authHeader = req.headers.get('Authorization');
    
    // Simple authorization check (you'd use a more secure approach in a real app)
    // The key is just a basic protection to prevent accidental db seeding
    if (!authHeader || authHeader !== 'Bearer seed-db-dev-only') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Seed the database
    const result = await seedDatabase();

    return NextResponse.json({
      message: 'Database seeded successfully',
      data: {
        userCount: result.users.length,
        teamCount: result.teams.length,
        invitationCount: result.invitations.length,
      }
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
} 