const fs = require('fs');
const path = require('path');

/**
 * Database Analysis Script
 * Analyzes the current Firebase database export and provides specific recommendations
 */

class DatabaseAnalyzer {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = null;
    this.analysis = {
      collections: {},
      idConflicts: [],
      recommendations: [],
      statistics: {}
    };
  }

  /**
   * Load and parse the database export
   */
  loadData() {
    try {
      console.log('📊 Loading database export...');
      const content = fs.readFileSync(this.filePath, 'utf8');
      this.data = JSON.parse(content);
      console.log('✅ Database loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to load database:', error.message);
      return false;
    }
  }

  /**
   * Analyze collections structure
   */
  analyzeCollections() {
    console.log('🔍 Analyzing collections...');
    
    const collections = [
      'franchiseProperties',
      'plots', 
      'preleasedProperties',
      'vacantProperties',
      'properties',
      'wishlists',
      'analytics'
    ];

    collections.forEach(collection => {
      if (this.data[collection]) {
        const data = this.data[collection];
        
        this.analysis.collections[collection] = {
          exists: true,
          type: Array.isArray(data) ? 'array' : 'object',
          count: Array.isArray(data) ? data.filter(item => item !== null).length : Object.keys(data).length,
          totalSlots: Array.isArray(data) ? data.length : Object.keys(data).length,
          nullEntries: Array.isArray(data) ? data.filter(item => item === null).length : 0
        };
      } else {
        this.analysis.collections[collection] = {
          exists: false,
          type: 'missing',
          count: 0
        };
      }
    });
  }

  /**
   * Detect ID conflicts
   */
  detectIdConflicts() {
    console.log('🔍 Detecting ID conflicts...');
    
    const idCollisions = {};
    
    // Check array-based collections for duplicate indices
    const arrayCollections = ['franchiseProperties', 'plots', 'preleasedProperties', 'vacantProperties'];
    
    arrayCollections.forEach(collection => {
      if (this.data[collection] && Array.isArray(this.data[collection])) {
        const items = this.data[collection];
        
        items.forEach((item, index) => {
          if (item !== null) {
            const id = index.toString();
            
            if (!idCollisions[id]) {
              idCollisions[id] = [];
            }
            
            idCollisions[id].push({
              collection: collection,
              index: index,
              title: this.getPropertyTitle(item, collection),
              data: item
            });
          }
        });
      }
    });

    // Find actual conflicts (same ID in multiple collections)
    Object.keys(idCollisions).forEach(id => {
      if (idCollisions[id].length > 1) {
        this.analysis.idConflicts.push({
          id: id,
          conflicts: idCollisions[id],
          impact: this.assessConflictImpact(id, idCollisions[id])
        });
      }
    });
  }

  /**
   * Get property title for display
   */
  getPropertyTitle(property, collection) {
    switch (collection) {
      case 'plots':
        return property.project || 'Plot Property';
      case 'franchiseProperties':
        return property.name || property.brand || 'Franchise Property';
      case 'preleasedProperties':
        return property.buildingName || property.tenant || 'Pre-leased Property';
      case 'vacantProperties':
        return property.location || 'Vacant Property';
      default:
        return property.title || property.name || 'Property';
    }
  }

  /**
   * Assess the impact of ID conflicts
   */
  assessConflictImpact(id, conflicts) {
    // Check if this ID is used in wishlists
    let usedInWishlists = false;
    
    if (this.data.wishlists) {
      Object.values(this.data.wishlists).forEach(userWishlist => {
        Object.values(userWishlist).forEach(item => {
          if (item.propertyId === id) {
            usedInWishlists = true;
          }
        });
      });
    }

    return {
      severity: usedInWishlists ? 'HIGH' : 'MEDIUM',
      usedInWishlists: usedInWishlists,
      affectedCollections: conflicts.length,
      description: usedInWishlists 
        ? `ID "${id}" is used in wishlists but exists in ${conflicts.length} collections`
        : `ID "${id}" exists in ${conflicts.length} collections`
    };
  }

  /**
   * Generate statistics
   */
  generateStatistics() {
    console.log('📈 Generating statistics...');
    
    let totalProperties = 0;
    let totalWishlistItems = 0;
    
    // Count properties
    Object.keys(this.analysis.collections).forEach(collection => {
      if (['franchiseProperties', 'plots', 'preleasedProperties', 'vacantProperties', 'properties'].includes(collection)) {
        totalProperties += this.analysis.collections[collection].count;
      }
    });

    // Count wishlist items
    if (this.data.wishlists) {
      Object.values(this.data.wishlists).forEach(userWishlist => {
        totalWishlistItems += Object.keys(userWishlist).length;
      });
    }

    this.analysis.statistics = {
      totalProperties: totalProperties,
      totalWishlistItems: totalWishlistItems,
      totalUsers: this.data.analytics?.users ? Object.keys(this.data.analytics.users).length : 0,
      collectionsWithArrays: Object.keys(this.analysis.collections).filter(
        col => this.analysis.collections[col].type === 'array'
      ).length,
      idConflictsCount: this.analysis.idConflicts.length,
      highImpactConflicts: this.analysis.idConflicts.filter(
        conflict => conflict.impact.severity === 'HIGH'
      ).length
    };
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    console.log('💡 Generating recommendations...');
    
    const recommendations = [];

    // Check for ID conflicts
    if (this.analysis.idConflicts.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'ID Conflicts',
        issue: `Found ${this.analysis.idConflicts.length} ID conflicts across collections`,
        impact: 'Wrong properties may be displayed in wishlists and search results',
        solution: 'Run database migration to create globally unique IDs',
        action: 'Execute migration script'
      });
    }

    // Check for array-based collections
    const arrayCollections = Object.keys(this.analysis.collections).filter(
      col => this.analysis.collections[col].type === 'array'
    );
    
    if (arrayCollections.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Data Structure',
        issue: `${arrayCollections.length} collections use array structure`,
        impact: 'Inefficient queries, sparse arrays, and ID management issues',
        solution: 'Migrate to object-based structure with proper keys',
        action: 'Included in migration script'
      });
    }

    // Check wishlist structure
    if (this.data.wishlists && this.analysis.statistics.totalWishlistItems > 0) {
      const hasConflictedWishlistItems = this.analysis.idConflicts.some(
        conflict => conflict.impact.usedInWishlists
      );
      
      if (hasConflictedWishlistItems) {
        recommendations.push({
          priority: 'HIGH',
          category: 'Wishlist Data',
          issue: 'Wishlist items reference conflicted property IDs',
          impact: 'Users see wrong properties in their wishlists',
          solution: 'Update wishlist items to use new unique property IDs',
          action: 'Included in migration script'
        });
      }
    }

    // Check for missing collections
    const missingCollections = Object.keys(this.analysis.collections).filter(
      col => !this.analysis.collections[col].exists
    );
    
    if (missingCollections.length > 0) {
      recommendations.push({
        priority: 'LOW',
        category: 'Missing Collections',
        issue: `Missing collections: ${missingCollections.join(', ')}`,
        impact: 'Some features may not work correctly',
        solution: 'Create missing collections with proper structure',
        action: 'Manual setup or included in migration'
      });
    }

    this.analysis.recommendations = recommendations;
  }

  /**
   * Run complete analysis
   */
  runAnalysis() {
    console.log('🚀 STARTING DATABASE ANALYSIS');
    console.log('=============================');
    
    if (!this.loadData()) {
      return false;
    }

    this.analyzeCollections();
    this.detectIdConflicts();
    this.generateStatistics();
    this.generateRecommendations();

    this.printReport();
    this.saveReport();
    
    return true;
  }

  /**
   * Print analysis report
   */
  printReport() {
    console.log('\n📊 DATABASE ANALYSIS REPORT');
    console.log('===========================');
    
    // Statistics
    console.log('\n📈 STATISTICS:');
    console.log(`   Total Properties: ${this.analysis.statistics.totalProperties}`);
    console.log(`   Total Wishlist Items: ${this.analysis.statistics.totalWishlistItems}`);
    console.log(`   Total Users: ${this.analysis.statistics.totalUsers}`);
    console.log(`   Collections with Arrays: ${this.analysis.statistics.collectionsWithArrays}`);
    console.log(`   ID Conflicts: ${this.analysis.statistics.idConflictsCount}`);
    console.log(`   High Impact Conflicts: ${this.analysis.statistics.highImpactConflicts}`);

    // Collections
    console.log('\n📁 COLLECTIONS:');
    Object.keys(this.analysis.collections).forEach(collection => {
      const info = this.analysis.collections[collection];
      const status = info.exists ? '✅' : '❌';
      const nullInfo = info.type === 'array' && info.nullEntries > 0 ? ` (${info.nullEntries} null entries)` : '';
      console.log(`   ${status} ${collection}: ${info.type}, ${info.count} items${nullInfo}`);
    });

    // ID Conflicts
    if (this.analysis.idConflicts.length > 0) {
      console.log('\n🚨 ID CONFLICTS:');
      this.analysis.idConflicts.forEach(conflict => {
        console.log(`   ID "${conflict.id}" (${conflict.impact.severity} impact):`);
        conflict.conflicts.forEach(item => {
          console.log(`     - ${item.collection}[${item.index}]: ${item.title}`);
        });
        if (conflict.impact.usedInWishlists) {
          console.log(`     ⚠️  This ID is used in user wishlists!`);
        }
        console.log('');
      });
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    this.analysis.recommendations.forEach((rec, index) => {
      const priority = rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : '🟢';
      console.log(`   ${priority} ${index + 1}. ${rec.category}: ${rec.issue}`);
      console.log(`      Impact: ${rec.impact}`);
      console.log(`      Solution: ${rec.solution}`);
      console.log(`      Action: ${rec.action}`);
      console.log('');
    });

    // Next Steps
    console.log('🎯 NEXT STEPS:');
    if (this.analysis.statistics.highImpactConflicts > 0) {
      console.log('   1. 🚨 URGENT: Run database migration immediately to fix ID conflicts');
      console.log('   2. Test migration on development database first');
      console.log('   3. Create backup before production migration');
      console.log('   4. Run: node migrate.js migrate');
    } else if (this.analysis.statistics.idConflictsCount > 0) {
      console.log('   1. Run database migration to improve structure and prevent future issues');
      console.log('   2. Run: node migrate.js migrate');
    } else {
      console.log('   1. ✅ No critical issues found');
      console.log('   2. Consider migration for performance improvements');
    }
  }

  /**
   * Save report to file
   */
  saveReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = `database-analysis-${timestamp}.json`;
    
    fs.writeFileSync(reportPath, JSON.stringify(this.analysis, null, 2));
    console.log(`\n📄 Report saved: ${reportPath}`);
  }
}

/**
 * Main execution
 */
async function main() {
  const dbPath = process.argv[2] || 'temp/stealdeals-e89ab-default-rtdb-export (2).json';
  
  if (!fs.existsSync(dbPath)) {
    console.error(`❌ Database file not found: ${dbPath}`);
    console.log('Usage: node analyze.js [path-to-database-export.json]');
    process.exit(1);
  }

  const analyzer = new DatabaseAnalyzer(dbPath);
  const success = analyzer.runAnalysis();
  
  if (!success) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Analysis failed:', error);
    process.exit(1);
  });
}

module.exports = DatabaseAnalyzer;