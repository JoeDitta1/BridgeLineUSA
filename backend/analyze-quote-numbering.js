// Analyze quote numbering conflict between local and Supabase
import './src/loadEnv.js';
import { getSupabaseClient } from './src/utils/supabaseClient.js';
import * as dbModule from './src/db.js';

const db = dbModule.default ?? dbModule.db ?? dbModule;

async function analyzeQuoteNumbering() {
  try {
    console.log('🔍 ANALYZING QUOTE NUMBERING CONFLICT...');
    
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('❌ No Supabase client available');
      return;
    }
    
    // Get highest quote numbers from both systems
    console.log('\n--- LOCAL SQLITE QUOTES ---');
    const localQuotes = db.prepare(`
      SELECT quote_no, customer_name, date, created_at, deleted_at 
      FROM quotes 
      WHERE quote_no LIKE 'SCM-Q%' 
      ORDER BY CAST(SUBSTR(quote_no, 6) AS INTEGER) DESC
    `).all();
    
    console.log(`📊 Local quotes: ${localQuotes.length}`);
    localQuotes.forEach(q => 
      console.log(`  - ${q.quote_no} (${q.customer_name}) - ${q.date} - deleted: ${q.deleted_at ? 'YES' : 'NO'}`)
    );
    
    const highestLocal = localQuotes.length > 0 ? 
      parseInt(localQuotes[0].quote_no.replace('SCM-Q', '')) : 0;
    console.log(`🔢 Highest local quote number: ${highestLocal}`);
    
    console.log('\n--- SUPABASE QUOTES ---');
    const { data: supabaseQuotes, error } = await supabase
      .from('quotes')
      .select('quote_no, customer_name, date, created_at')
      .order('id', { ascending: false });
      
    if (error) {
      console.error('❌ Error fetching Supabase quotes:', error);
      return;
    }
    
    console.log(`📊 Supabase quotes: ${supabaseQuotes.length}`);
    supabaseQuotes.forEach(q => 
      console.log(`  - ${q.quote_no} (${q.customer_name}) - ${q.date} - ${q.created_at}`)
    );
    
    const supabaseNumbers = supabaseQuotes
      .filter(q => q.quote_no && q.quote_no.startsWith('SCM-Q'))
      .map(q => parseInt(q.quote_no.replace('SCM-Q', '')))
      .filter(n => !isNaN(n));
      
    const highestSupabase = supabaseNumbers.length > 0 ? Math.max(...supabaseNumbers) : 0;
    console.log(`🔢 Highest Supabase quote number: ${highestSupabase}`);
    
    console.log('\n--- CONFLICT ANALYSIS ---');
    console.log(`❌ NUMBERING CONFLICT DETECTED:`);
    console.log(`   - Local highest: ${highestLocal} (next would be ${highestLocal + 1})`);
    console.log(`   - Supabase highest: ${highestSupabase} (next should be ${highestSupabase + 1})`);
    console.log(`   - Gap: ${highestSupabase - highestLocal} quotes`);
    
    if (highestLocal < highestSupabase) {
      console.log(`\n⚠️  LOCAL IS BEHIND: Local will generate duplicate quote numbers!`);
    }
    
    // Check for actual conflicts
    console.log('\n--- CHECKING FOR ACTUAL CONFLICTS ---');
    const conflicts = [];
    for (const localQ of localQuotes) {
      const conflictingSupabase = supabaseQuotes.find(sq => sq.quote_no === localQ.quote_no);
      if (conflictingSupabase) {
        conflicts.push({
          quote_no: localQ.quote_no,
          local: { customer: localQ.customer_name, date: localQ.date },
          supabase: { customer: conflictingSupabase.customer_name, date: conflictingSupabase.date }
        });
      }
    }
    
    console.log(`🚨 Found ${conflicts.length} actual conflicts:`);
    conflicts.forEach(c => 
      console.log(`  - ${c.quote_no}: Local(${c.local.customer}, ${c.local.date}) vs Supabase(${c.supabase.customer}, ${c.supabase.date})`)
    );
    
    console.log('\n--- RECOMMENDED SOLUTIONS ---');
    console.log('1. 🧹 CLEAN SLATE: Delete all Supabase quotes and re-sync from local');
    console.log('2. 🔄 RENUMBER LOCAL: Update local quote numbers to avoid conflicts');
    console.log('3. ⚡ SYNC GAPS: Add missing quotes from Supabase to local');
    
  } catch (err) {
    console.error('❌ Analysis error:', err);
  }
}

analyzeQuoteNumbering().then(() => process.exit(0));