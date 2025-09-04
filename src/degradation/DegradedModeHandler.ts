// Mock implementation for testing
export type DegradationLevel = 'normal' | 'soft' | 'warning' | 'critical';

export interface DegradationStatus {
  level: DegradationLevel;
  message: string;
  features: Array<{
    name: string;
    impact: 'disabled' | 'delayed' | 'cached' | 'polling';
    description: string;
  }>;
  estimatedRecovery: Date | null;
  recommendations: string[];
  userVisible: boolean;
}

export class DegradedModeHandler {
  shouldDegrade() { return false; }
  handleDegradation() {}
  restore() {}
  getMode() { return 'normal'; }
}