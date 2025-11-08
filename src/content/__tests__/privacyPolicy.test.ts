/**
 * Privacy Policy Snapshot Tests
 *
 * These tests ensure the privacy policy content doesn't change accidentally.
 * If the privacy policy needs to be updated, review the changes carefully
 * and update the snapshot with: npm test -- -u
 */

import { privacyPolicyContent } from '../privacyPolicy';

describe('Privacy Policy', () => {
  it('should match snapshot', () => {
    expect(privacyPolicyContent).toMatchSnapshot();
  });

  it('should contain key privacy commitments', () => {
    // Verify critical privacy promises are present
    expect(privacyPolicyContent).toContain('We collect ZERO data');
    expect(privacyPolicyContent).toContain('No servers');
    expect(privacyPolicyContent).toContain('No analytics');
    expect(privacyPolicyContent).toContain('No third-party services');
    expect(privacyPolicyContent).toContain('No internet connection required');
    expect(privacyPolicyContent).toContain('No accounts');
  });

  it('should mention data storage security', () => {
    expect(privacyPolicyContent).toContain('Keychain Services');
    expect(privacyPolicyContent).toContain('AES-256');
    expect(privacyPolicyContent).toContain('Android Keystore');
  });

  it('should have a last updated date', () => {
    expect(privacyPolicyContent).toMatch(/Last Updated:/);
  });

  it('should mention CDC data usage', () => {
    expect(privacyPolicyContent).toContain('CDC');
    expect(privacyPolicyContent).toContain('growth chart data');
    expect(privacyPolicyContent).toContain('cached locally');
  });

  it('should explain user rights', () => {
    expect(privacyPolicyContent).toContain('Your Rights');
    expect(privacyPolicyContent).toContain('Uninstalling the app');
  });
});
