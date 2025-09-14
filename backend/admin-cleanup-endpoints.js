// Add this to your adminRoute.js for testing and cleanup

// GET /admin/system-status - Check system health and cleanup status
router.get('/system-status', async (req, res) => {
  try {
    const quotesInDb = db.prepare('SELECT COUNT(*) as count FROM quotes').get();
    const quotesWithDeleted = db.prepare('SELECT COUNT(*) as count FROM quotes WHERE deleted_at IS NOT NULL').get();
    
    // Count filesystem folders
    const fs = await import('fs/promises');
    const path = await import('path');
    const quotesDir = path.join(process.cwd(), 'data', 'quotes');
    
    let filesystemFolders = 0;
    try {
      const entries = await fs.readdir(quotesDir, { withFileTypes: true });
      filesystemFolders = entries.filter(e => e.isDirectory()).length;
    } catch (err) {
      console.log('Error reading quotes directory:', err.message);
    }
    
    const status = {
      database: {
        totalQuotes: quotesInDb.count,
        softDeletedQuotes: quotesWithDeleted.count,
        activeQuotes: quotesInDb.count - quotesWithDeleted.count
      },
      filesystem: {
        customerFolders: filesystemFolders
      },
      systemHealth: {
        databaseConnected: true,
        quotesDirectoryExists: filesystemFolders >= 0,
        orphanedFolders: filesystemFolders > 0 && quotesInDb.count === 0
      }
    };
    
    res.json({ ok: true, status });
  } catch (error) {
    console.error('[admin] System status error:', error);
    res.status(500).json({ ok: false, error: 'Failed to get system status' });
  }
});

// POST /admin/cleanup-orphaned-folders - Clean up folders that don't have database records
router.post('/cleanup-orphaned-folders', async (req, res) => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const quotesDir = path.join(process.cwd(), 'data', 'quotes');
    
    // Get all quotes from database
    const dbQuotes = new Set();
    const quotes = db.prepare('SELECT quote_no FROM quotes').all();
    quotes.forEach(q => dbQuotes.add(q.quote_no));
    
    let foldersRemoved = 0;
    let customersRemoved = 0;
    const removedItems = [];
    
    try {
      const customerDirs = await fs.readdir(quotesDir, { withFileTypes: true });
      
      for (const customerDir of customerDirs) {
        if (!customerDir.isDirectory()) continue;
        
        const customerPath = path.join(quotesDir, customerDir.name);
        const quoteDirs = await fs.readdir(customerPath, { withFileTypes: true });
        const quoteDirectories = quoteDirs.filter(d => d.isDirectory());
        
        let quotesKeptForCustomer = 0;
        
        for (const quoteDir of quoteDirectories) {
          const quotePath = path.join(customerPath, quoteDir.name);
          
          // Parse quote number from folder name
          const quoteMatch = quoteDir.name.match(/^([A-Z]+-[QSO]\\d+)/);
          if (!quoteMatch) {
            // Not a valid quote folder, remove it
            await fs.rm(quotePath, { recursive: true, force: true });
            foldersRemoved++;
            removedItems.push(`Invalid folder: ${customerDir.name}/${quoteDir.name}`);
            continue;
          }
          
          const quoteNo = quoteMatch[1];
          if (!dbQuotes.has(quoteNo)) {
            // Quote doesn't exist in database, remove folder
            await fs.rm(quotePath, { recursive: true, force: true });
            foldersRemoved++;
            removedItems.push(`Orphaned quote: ${customerDir.name}/${quoteDir.name}`);
          } else {
            quotesKeptForCustomer++;
          }
        }
        
        // Remove customer folder if no quotes remain
        if (quotesKeptForCustomer === 0) {
          await fs.rm(customerPath, { recursive: true, force: true });
          customersRemoved++;
          removedItems.push(`Empty customer: ${customerDir.name}`);
        }
      }
    } catch (err) {
      console.error('Cleanup error:', err);
      return res.status(500).json({ ok: false, error: err.message });
    }
    
    res.json({
      ok: true,
      message: 'Cleanup completed',
      summary: {
        foldersRemoved,
        customersRemoved,
        totalDbQuotes: dbQuotes.size,
        removedItems
      }
    });
  } catch (error) {
    console.error('[admin] Cleanup error:', error);
    res.status(500).json({ ok: false, error: 'Failed to cleanup orphaned folders' });
  }
});
