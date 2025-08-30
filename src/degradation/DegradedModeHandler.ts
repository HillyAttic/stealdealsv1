// Mock implementation for testing
export class DegradedModeHandler {
  shouldDegrade() { return false; }
  handleDegradation() {}
  restore() {}
  getMode() { return 'normal'; }
}