# CatsConnect - Team Matching Platform

A comprehensive team matching platform that helps users find compatible teammates based on their profiles, skills, roles, and working styles.

## Features

- **Smart Matching Algorithm**: Intelligently matches users based on their profile information
- **Compatibility Scoring**: Detailed compatibility metrics between potential teammates
- **Team Management**: Create, manage, and organize teams
- **Invitation System**: Send and receive team invitations

## Getting Started

### Prerequisites

- Node.js 17.x or higher
- npm or pnpm
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd catsconnect
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Update the MongoDB connection string in `.env.local`

```bash
cp .env.local.example .env.local
```

4. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Setup

This project uses MongoDB. You can either:

1. **Set up a local MongoDB instance**:
   - Install MongoDB on your machine
   - Start the MongoDB service
   - Update your `.env.local` file with: `MONGODB_URI=mongodb://localhost:27017/catsconnect_db`

2. **Use MongoDB Atlas (recommended for production)**:
   - Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Set up a cluster and get your connection string
   - Update your `.env.local` file with the provided connection string

## Architecture

### Data Models

- **User**: Stores user profile information, skills, and preferences
- **Team**: Manages team composition and project information
- **Invitation**: Tracks team invitations between users
- **UserMatch**: Records compatibility scores between users

### Compatibility Algorithm

The matching algorithm evaluates users on multiple dimensions:

1. **Role Compatibility**: How well different roles complement each other
2. **Skills Compatibility**: Evaluation of shared and complementary skills
3. **Availability Compatibility**: Matching of available working hours
4. **Working Style Compatibility**: Alignment of communication preferences and work habits

## Contributing
