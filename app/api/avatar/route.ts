import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const name = searchParams.get('name') || 'User';
    const size = parseInt(searchParams.get('size') || '100');
    const bgColor = searchParams.get('bg') || getRandomColor();
    const textColor = searchParams.get('color') || '#FFFFFF';
    
    // Get initials from name (first letter of first and last name)
    const initials = name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    // Create SVG for avatar
    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="${bgColor}" />
        <text 
          x="50%" 
          y="50%" 
          dy=".1em" 
          fill="${textColor}" 
          font-family="Arial, sans-serif" 
          font-size="${size / 2.5}" 
          font-weight="bold" 
          text-anchor="middle" 
          dominant-baseline="middle"
        >
          ${initials}
        </text>
      </svg>
    `;
    
    // Return SVG with appropriate headers
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Avatar generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate avatar' },
      { status: 500 }
    );
  }
}

// Generate a random color
function getRandomColor(): string {
  const colors = [
    '#4f46e5', // indigo
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f43f5e', // rose
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#06b6d4', // cyan
    '#3b82f6', // blue
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
} 