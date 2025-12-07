const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Fact = require('../../models/factModel');
const User = require('../../models/userModel');
// const Category = require('../../models/categoryModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log('DB connected!'));

// READ JSON FILE
const facts = JSON.parse(fs.readFileSync(`${__dirname}/facts.json`, 'utf-8'));
// const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

// const categories = [
//   { category: 'technology', colour: '3b82f6' },
//   { category: 'science', colour: '16a34a' },
//   { category: 'finance', colour: 'ef4444' },
//   { category: 'society', colour: 'eab308' },
//   { category: 'entertainment', colour: '8b5cf6' },
//   { category: 'health', colour: 'ec4899' },
//   { category: 'history', colour: '14b8a6' },
//   { category: 'news', colour: '6b7280' },
// ];

// IMPORT DEVELOPMENT DATA INTO DB
const importData = async () => {
  try {
    // 1. Find the admin user by email
    const adminUser = await User.findOne({ email: 'admin@factly.com' });
    
    if (!adminUser) {
      console.log('Admin user not found! Please create admin@factly.com first.');
      process.exit(1);
    }
    
    console.log(`Found admin user: ${adminUser.username} (${adminUser._id})`);
    
    // 2. Add the admin's userId to all facts
    const factsWithUserId = facts.map(fact => ({
      ...fact,
      userId: adminUser._id
    }));
    
    // 3. Import facts with userId
    await Fact.create(factsWithUserId);
    
    console.log('Loaded Facts Successfully!');
    console.log(`Total facts imported: ${factsWithUserId.length}`);
    
  } catch (err) {
    console.log('Error 💥:', err);
  }
  process.exit();
};

// IMPORT DEVELOPMENT DATA INTO DB
// const importData = async () => {
//   try {
//     // await User.create(users, { validateBeforeSave: false });
//     // await Category.create(categories);
//     console.log('Loaded Data Successfully!');
//   } catch (err) {
//     console.log(err);
//   }
//   process.exit();
// };

const deleteData = async () => {
  try {
    await Fact.deleteMany();
    // await User.deleteMany();
    // await Category.deleteMany();
    console.log('Deleted Data Successfully!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// console.log(process.argv);

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// Quick test
const testPopulate = async () => {
  const facts = await Fact.find().limit(5);
  console.log('Sample fact with user:', JSON.stringify(facts[0], null, 2));
  process.exit();
};

if (process.argv[2] === '--test') {
  testPopulate();
}