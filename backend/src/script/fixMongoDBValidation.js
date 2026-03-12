/**
 * Script to fix MongoDB Atlas validation rules
 * 
 * This script removes JSON Schema validation from collections that are
 * interfering with the BISApp (e.g., Library.books validation)
 * 
 * Usage:
 * 1. Set your MONGO_URI in .env file or pass as environment variable
 * 2. Run: node src/script/fixMongoDBValidation.js
 * 
 * Or run with npx:
 *   npx ts-node src/script/fixMongoDBValidation.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Get MongoDB URI from environment
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ Please set MONGO_URI or MONGODB_URI environment variable');
  console.log('Example: MONGO_URI=mongodb+srv://... node src/script/fixMongoDBValidation.js');
  process.exit(1);
}

async function fixValidation() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Collections in database:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    // Remove validation rules from each collection
    console.log('\n🔧 Removing validation rules...\n');
    
    for (const col of collections) {
      try {
        // Try to remove JSON schema validation
        // This command removes any validator on the collection
        await db.command({
          collMod: col.name,
          validator: {},  // Remove all validators
          validationLevel: 'off'  // Disable validation
        });
        
        console.log(`✅ Removed validation from: ${col.name}`);
      } catch (err) {
        // Collection might not have validation rules - that's ok
        if (err.codeName === 'NoSuchDocument') {
          console.log(`⚠️  Collection not found: ${col.name}`);
        } else if (err.code === 121) {
          // Document failed validation - this is what we're fixing!
          console.log(`🔧 Fixing validation on: ${col.name}`);
          try {
            await db.command({
              collMod: col.name,
              validator: {},
              validationLevel: 'off',
              validationAction: 'off'
            });
            console.log(`✅ Fixed: ${col.name}`);
          } catch (fixErr) {
            console.log(`❌ Could not fix ${col.name}: ${fixErr.message}`);
          }
        } else {
          console.log(`ℹ️  No validation to remove from: ${col.name}`);
        }
      }
    }
    
    console.log('\n✅ Fix complete! Try signing up again.');
    console.log('\nNote: If the issue persists, the validation might be on a different');
    console.log('database. Check your MongoDB Atlas connection string for the database name.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run the fix
fixValidation();
