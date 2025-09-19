// Real-time monitoring of quote creation and sync
import './src/loadEnv.js';
import { getSupabaseClient } from './src/utils/supabaseClient.js';
import * as dbModule from './src/db.js';

const db = dbModule.default ?? dbModule.db ?? dbModule;

async function monitorQuoteCreation() {
  console.log('👀 MONITORING QUOTE CREATION AND SYNC...');
  console.log('Create a new quote in the UI and watch the sync happen here');
  console.log('Press Ctrl+C to stop monitoring\n');
  
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error('❌ No Supabase client available');
    return;
  }
  
  let lastLocalCount = 0;
  let lastSupabaseCount = 0;
  let checkCount = 0;
  
  const checkSystems = async () => {
    try {
      checkCount++;
      
      // Check local SQLite
      const localQuotes = db.prepare('SELECT quote_no, customer_name, date, created_at FROM quotes ORDER BY created_at DESC').all();
      const localCount = localQuotes.length;
      
      // Check Supabase
      const { data: supabaseQuotes, error } = await supabase
        .from('quotes')
        .select('quote_no, customer_name, date, created_at')
        .order('created_at', { ascending: false });
        
      const supabaseCount = supabaseQuotes?.length || 0;
      
      // Only log if there are changes
      if (localCount !== lastLocalCount || supabaseCount !== lastSupabaseCount) {
        console.log(`\n🔄 Check #${checkCount} - ${new Date().toLocaleTimeString()}`);
        console.log(`📊 Local: ${localCount} quotes | Supabase: ${supabaseCount} quotes`);
        
        if (localCount > lastLocalCount) {
          console.log('🆕 NEW LOCAL QUOTES:');
          localQuotes.slice(0, localCount - lastLocalCount).forEach(q => 
            console.log(`   📝 ${q.quote_no} (${q.customer_name}) - ${q.date} - ${q.created_at}`)
          );
        }
        
        if (supabaseCount > lastSupabaseCount) {
          console.log('🆕 NEW SUPABASE QUOTES:');
          supabaseQuotes?.slice(0, supabaseCount - lastSupabaseCount).forEach(q => 
            console.log(`   ☁️  ${q.quote_no} (${q.customer_name}) - ${q.date} - ${q.created_at}`)
          );
        }
        
        // Check for sync status
        if (localCount > 0 || supabaseCount > 0) {
          if (localCount === supabaseCount) {
            console.log('✅ SYNC STATUS: In sync');
          } else {
            console.log(`⚠️  SYNC STATUS: Out of sync (Local: ${localCount}, Supabase: ${supabaseCount})`);
          }
        }
        
        lastLocalCount = localCount;
        lastSupabaseCount = supabaseCount;
      } else if (checkCount % 20 === 0) {
        // Status update every 20 checks
        console.log(`⏳ Still monitoring... (Check #${checkCount}) - No changes yet`);
      }
      
    } catch (err) {
      console.error('❌ Monitoring error:', err.message);
    }
  };
  
  // Initial check
  await checkSystems();
  
  // Check every 2 seconds
  const interval = setInterval(checkSystems, 2000);
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Monitoring stopped');
    clearInterval(interval);
    process.exit(0);
  });
}

monitorQuoteCreation();