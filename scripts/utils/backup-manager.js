// Backup manager utility for franchise migration
const fs = require('fs');
const path = require('path');
const { get, ref } = require('./firebase-connection');

class BackupManager {
  constructor(database) {
    this.database = database;
    this.backupDir = path.join(process.cwd(), 'backups');
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log(`📁 Created backup directory: ${this.backupDir}`);
    }
  }

  generateBackupFilename() {
    const timestamp = new Date().toISOString()
      .replace(/:/g, '-')
      .replace(/\./g, '-')
      .slice(0, 19);
    return `franchise-backup-${timestamp}.json`;
  }

  async createBackup() {
    try {
      console.log('💾 Creating backup of franchise data...');
      
      // Backup migratedProperties/franchise
      const migratedSnapshot = await get(ref(this.database, 'migratedProperties/franchise'));
      const migratedData = migratedSnapshot.val();
      
      // Backup legacy franchiseProperties (if exists)
      const legacySnapshot = await get(ref(this.database, 'franchiseProperties'));
      const legacyData = legacySnapshot.val();

      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        description: 'Franchise data backup before redundancy cleanup',
        data: {
          migratedProperties: {
            franchise: migratedData || {}
          },
          franchiseProperties: legacyData || {}
        },
        stats: {
          migratedCount: migratedData ? Object.keys(migratedData).length : 0,
          legacyCount: legacyData ? Object.keys(legacyData).length : 0
        }
      };

      const filename = this.generateBackupFilename();
      const filePath = path.join(this.backupDir, filename);
      
      fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
      
      const fileSize = Math.round(fs.statSync(filePath).size / 1024);
      console.log(`✅ Backup created: ${filename} (${fileSize}KB)`);
      console.log(`   Location: ${filePath}`);
      console.log(`   Franchises backed up: ${backupData.stats.migratedCount + backupData.stats.legacyCount}`);
      
      return {
        filename,
        filePath,
        size: fileSize,
        stats: backupData.stats
      };
    } catch (error) {
      console.error('❌ Backup creation failed:', error.message);
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  async restoreFromBackup(backupFilePath) {
    try {
      console.log(`🔄 Restoring from backup: ${backupFilePath}`);
      
      if (!fs.existsSync(backupFilePath)) {
        throw new Error(`Backup file not found: ${backupFilePath}`);
      }

      const backupContent = fs.readFileSync(backupFilePath, 'utf8');
      const backupData = JSON.parse(backupContent);

      // Restore migratedProperties/franchise
      if (backupData.data.migratedProperties?.franchise) {
        await set(ref(this.database, 'migratedProperties/franchise'), backupData.data.migratedProperties.franchise);
        console.log('✅ Restored migratedProperties/franchise');
      }

      // Restore legacy franchiseProperties (if exists in backup)
      if (backupData.data.franchiseProperties && Object.keys(backupData.data.franchiseProperties).length > 0) {
        await set(ref(this.database, 'franchiseProperties'), backupData.data.franchiseProperties);
        console.log('✅ Restored franchiseProperties');
      }

      console.log('🎉 Backup restoration completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Backup restoration failed:', error.message);
      throw new Error(`Failed to restore backup: ${error.message}`);
    }
  }

  listBackups() {
    const backups = fs.readdirSync(this.backupDir)
      .filter(file => file.startsWith('franchise-backup-') && file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          path: filePath,
          size: Math.round(stats.size / 1024),
          created: stats.mtime
        };
      })
      .sort((a, b) => b.created - a.created);

    return backups;
  }

  getBackupInfo(backupFilePath) {
    try {
      const backupContent = fs.readFileSync(backupFilePath, 'utf8');
      const backupData = JSON.parse(backupContent);
      return {
        timestamp: backupData.timestamp,
        version: backupData.version,
        description: backupData.description,
        stats: backupData.stats
      };
    } catch (error) {
      return null;
    }
  }
}

module.exports = BackupManager;