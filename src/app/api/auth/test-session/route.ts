import { NextRequest, NextResponse } from 'next/server';
import { runAllTests } from '@/lib/auth/verify-session-management';

export async function GET(request: NextRequest) {
  try {
    console.log('Running session management verification tests...');
    
    // Capture console output
    const originalLog = console.log;
    const originalError = console.error;
    const logs: string[] = [];
    
    console.log = (...args) => {
      logs.push(args.join(' '));
      originalLog(...args);
    };
    
    console.error = (...args) => {
      logs.push(`ERROR: ${args.join(' ')}`);
      originalError(...args);
    };
    
    // Run tests
    const allPassed = runAllTests();
    
    // Restore console
    console.log = originalLog;
    console.error = originalError;
    
    return NextResponse.json({
      success: true,
      allTestsPassed: allPassed,
      message: allPassed ? 'All session management tests passed!' : 'Some tests failed',
      logs: logs,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test execution error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Test execution failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}