/**
 * Terms of Service Snapshot Tests
 *
 * These tests ensure the terms of service content doesn't change accidentally.
 * If the terms need to be updated, review the changes carefully
 * and update the snapshot with: npm test -- -u
 */

import { termsOfServiceContent } from '../termsOfService';

describe('Terms of Service', () => {
  it('should match snapshot', () => {
    expect(termsOfServiceContent).toMatchSnapshot();
  });

  it('should contain key legal sections', () => {
    // Verify critical legal sections are present
    expect(termsOfServiceContent).toContain('Acceptance of Terms');
    expect(termsOfServiceContent).toContain('Medical Disclaimer');
    expect(termsOfServiceContent).toContain('Use at Your Own Risk');
    expect(termsOfServiceContent).toContain('Data Responsibility');
    expect(termsOfServiceContent).toContain('No Warranty');
    expect(termsOfServiceContent).toContain('Limitation of Liability');
  });

  it('should have strong medical disclaimer', () => {
    expect(termsOfServiceContent).toContain('NOT a substitute for professional medical advice');
    expect(termsOfServiceContent).toContain('qualified healthcare provider');
  });

  it('should have a last updated date', () => {
    expect(termsOfServiceContent).toMatch(/Last Updated:/);
  });

  it('should explain data responsibility', () => {
    expect(termsOfServiceContent).toContain('securely store your data locally');
    expect(termsOfServiceContent).toContain('maintaining backups');
  });

  it('should include indemnification', () => {
    expect(termsOfServiceContent).toContain('Indemnification');
    expect(termsOfServiceContent).toContain('indemnify and hold harmless');
  });

  it('should include governing law', () => {
    expect(termsOfServiceContent).toContain('Governing Law');
  });
});
