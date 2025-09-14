// backend/cleanup-user.mjs
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAllUsers() {
  console.log('\n=== ALL USERS IN SUPABASE AUTH ===');
  const { data: authUsers, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  console.log(`Found ${authUsers.users.length} users:`);
  authUsers.users.forEach((user, index) => {
    console.log(`${index + 1}. ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Created: ${user.created_at}`);
    console.log(`   Last Sign In: ${user.last_sign_in_at || 'Never'}`);
    console.log(`   Banned: ${user.banned_until ? 'Yes' : 'No'}`);
    console.log('');
  });

  console.log('\n=== USER PROFILES TABLE ===');
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('*');
  
  if (profileError) {
    console.error('Error fetching profiles:', profileError);
  } else {
    console.log(`Found ${profiles.length} profiles:`);
    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. User ID: ${profile.user_id}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Role: ${profile.role}`);
      console.log(`   Company: ${profile.company || 'None'}`);
      console.log('');
    });
  }
}

async function deleteUserCompletely(email) {
  console.log(`\n=== DELETING USER: ${email} ===`);
  
  // First, find the user by email
  const { data: authUsers, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }
  
  const user = authUsers.users.find(u => u.email === email);
  if (!user) {
    console.log('User not found in Auth');
    return;
  }
  
  console.log(`Found user: ${user.id}`);
  
  // Delete from user_profiles table
  const { error: profileError } = await supabase
    .from('user_profiles')
    .delete()
    .eq('user_id', user.id);
    
  if (profileError) {
    console.log('Profile deletion error (might not exist):', profileError.message);
  } else {
    console.log('✓ Deleted from user_profiles table');
  }
  
  // Delete from Supabase Auth
  const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
  
  if (authError) {
    console.error('Auth deletion error:', authError);
  } else {
    console.log('✓ Deleted from Supabase Auth');
  }
  
  console.log('User deletion complete!');
}

// Main execution
const command = process.argv[2];
const email = process.argv[3];

if (command === 'list') {
  listAllUsers();
} else if (command === 'delete' && email) {
  deleteUserCompletely(email);
} else {
  console.log('Usage:');
  console.log('  node cleanup-user.mjs list');
  console.log('  node cleanup-user.mjs delete email@example.com');
}