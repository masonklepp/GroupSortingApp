/* global use, db */
// CatsConnect MongoDB Playground - Create Admin User

// Select the database
use('catsconnect_db');

// First, let's see what users we currently have
console.log("--- CHECKING EXISTING USERS ---");
const existingUsers = db.users.find({}).toArray();
console.log("Existing users:", existingUsers.map(user => ({ 
  email: user.email, 
  name: user.name,
  role: user.role
})));

// Now, let's create a new admin user
console.log("\n--- CREATING ADMIN USER ---");
const result = db.users.insertOne({
  name: "Professor Admin",
  email: "prof@gmail.com",
  role: "admin",
  password: "$2b$10$MlyJ1JM8tVgRaFHZ8.UD0.bN9W.a8OsIPiVnk1ADbQ.R89dJLCjHO", // hashed password for "password123"
  skills: [],
  availability: "Flexible",
  createdAt: new Date(),
  updatedAt: new Date()
});

console.log("Insert result:", result);

// Verify the admin user was created
console.log("\n--- VERIFYING ADMIN USER ---");
const adminUser = db.users.findOne({ email: "prof@gmail.com" });
console.log("Admin user details:", adminUser);

// If you see the admin user was created successfully, you can now log in with:
// Email: prof@gmail.com
// Password: password123