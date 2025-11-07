/**
 * Age Calculator Tests
 */

import {
  calculateAgeInMonths,
  calculateAge,
  formatAge,
  getAgeAtMeasurement,
  getCurrentAge,
  isValidAgeForChart,
} from '../ageCalculator';

describe('ageCalculator', () => {
  describe('calculateAgeInMonths', () => {
    it('should calculate age in months for a newborn', () => {
      const birthDate = new Date('2024-01-01');
      const measurementDate = new Date('2024-01-15');
      const ageInMonths = calculateAgeInMonths(birthDate, measurementDate);

      // 14 days / 30.4375 days/month ≈ 0.46 months
      expect(ageInMonths).toBeCloseTo(0.46, 1);
    });

    it('should calculate age in months for a 6-month-old', () => {
      const birthDate = new Date('2024-01-01');
      const measurementDate = new Date('2024-07-01');
      const ageInMonths = calculateAgeInMonths(birthDate, measurementDate);

      // 182 days / 30.4375 ≈ 5.98 months
      expect(ageInMonths).toBeCloseTo(6, 1);
    });

    it('should calculate age in months for a 2-year-old', () => {
      const birthDate = new Date('2022-01-01');
      const measurementDate = new Date('2024-01-01');
      const ageInMonths = calculateAgeInMonths(birthDate, measurementDate);

      // 730 days / 30.4375 ≈ 24 months
      expect(ageInMonths).toBeCloseTo(24, 1);
    });

    it('should work with string dates', () => {
      const ageInMonths = calculateAgeInMonths('2024-01-01', '2024-02-01');

      // 31 days / 30.4375 ≈ 1.02 months
      expect(ageInMonths).toBeCloseTo(1, 1);
    });

    it('should use current date when measurement date is not provided', () => {
      const birthDate = new Date();
      birthDate.setMonth(birthDate.getMonth() - 6);

      const ageInMonths = calculateAgeInMonths(birthDate);

      expect(ageInMonths).toBeCloseTo(6, 0);
    });
  });

  describe('calculateAge', () => {
    it('should calculate age breakdown for a newborn', () => {
      const birthDate = new Date('2024-01-01');
      const measurementDate = new Date('2024-01-15');

      const age = calculateAge(birthDate, measurementDate);

      expect(age.years).toBe(0);
      expect(age.months).toBe(0);
      expect(age.totalMonths).toBe(0);
      expect(age.totalDays).toBe(14);
    });

    it('should calculate age breakdown for a 6-month-old', () => {
      const birthDate = new Date('2024-01-01');
      const measurementDate = new Date('2024-07-01');

      const age = calculateAge(birthDate, measurementDate);

      expect(age.years).toBe(0);
      expect(age.months).toBe(6);
      expect(age.totalMonths).toBe(6);
    });

    it('should calculate age breakdown for a 2-year-old with 3 months', () => {
      const birthDate = new Date('2022-01-01');
      const measurementDate = new Date('2024-04-01');

      const age = calculateAge(birthDate, measurementDate);

      expect(age.years).toBe(2);
      expect(age.months).toBe(3);
      expect(age.totalMonths).toBe(27);
    });

    it('should handle exact year boundaries', () => {
      const birthDate = new Date('2022-01-01');
      const measurementDate = new Date('2024-01-01');

      const age = calculateAge(birthDate, measurementDate);

      expect(age.years).toBe(2);
      expect(age.months).toBe(0);
      expect(age.totalMonths).toBe(24);
    });
  });

  describe('formatAge', () => {
    it('should format newborn age in months', () => {
      const age = {
        years: 0,
        months: 0,
        totalMonths: 0,
        totalDays: 14,
      };

      expect(formatAge(age)).toBe('0 months');
    });

    it('should format single month correctly', () => {
      const age = {
        years: 0,
        months: 1,
        totalMonths: 1,
        totalDays: 30,
      };

      expect(formatAge(age)).toBe('1 month');
    });

    it('should format multiple months correctly', () => {
      const age = {
        years: 0,
        months: 6,
        totalMonths: 6,
        totalDays: 180,
      };

      expect(formatAge(age)).toBe('6 months');
    });

    it('should format single year correctly', () => {
      const age = {
        years: 1,
        months: 0,
        totalMonths: 12,
        totalDays: 365,
      };

      expect(formatAge(age)).toBe('1 year');
    });

    it('should format multiple years correctly', () => {
      const age = {
        years: 2,
        months: 0,
        totalMonths: 24,
        totalDays: 730,
      };

      expect(formatAge(age)).toBe('2 years');
    });

    it('should format years and months correctly', () => {
      const age = {
        years: 2,
        months: 3,
        totalMonths: 27,
        totalDays: 820,
      };

      expect(formatAge(age)).toBe('2 years, 3 months');
    });

    it('should format singular year with singular month', () => {
      const age = {
        years: 1,
        months: 1,
        totalMonths: 13,
        totalDays: 395,
      };

      expect(formatAge(age)).toBe('1 year, 1 month');
    });
  });

  describe('getAgeAtMeasurement', () => {
    it('should calculate age at a specific measurement date', () => {
      const age = getAgeAtMeasurement('2022-01-01', '2024-04-15');

      expect(age.years).toBe(2);
      expect(age.months).toBe(3);
    });
  });

  describe('getCurrentAge', () => {
    it('should calculate current age from birthdate', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 2);
      birthDate.setMonth(birthDate.getMonth() - 3);

      const age = getCurrentAge(birthDate.toISOString());

      expect(age.years).toBe(2);
      expect(age.months).toBe(3);
    });
  });

  describe('isValidAgeForChart', () => {
    describe('CDC charts', () => {
      it('should accept age 0 months', () => {
        expect(isValidAgeForChart(0, 'CDC')).toBe(true);
      });

      it('should accept age 24 months', () => {
        expect(isValidAgeForChart(24, 'CDC')).toBe(true);
      });

      it('should accept age 120 months (10 years)', () => {
        expect(isValidAgeForChart(120, 'CDC')).toBe(true);
      });

      it('should accept age 240 months (20 years)', () => {
        expect(isValidAgeForChart(240, 'CDC')).toBe(true);
      });

      it('should reject age 241 months', () => {
        expect(isValidAgeForChart(241, 'CDC')).toBe(false);
      });

      it('should reject negative age', () => {
        expect(isValidAgeForChart(-1, 'CDC')).toBe(false);
      });
    });

    describe('WHO charts', () => {
      it('should accept age 0 months', () => {
        expect(isValidAgeForChart(0, 'WHO')).toBe(true);
      });

      it('should accept age 24 months', () => {
        expect(isValidAgeForChart(24, 'WHO')).toBe(true);
      });

      it('should accept age 60 months (5 years)', () => {
        expect(isValidAgeForChart(60, 'WHO')).toBe(true);
      });

      it('should reject age 61 months', () => {
        expect(isValidAgeForChart(61, 'WHO')).toBe(false);
      });

      it('should reject negative age', () => {
        expect(isValidAgeForChart(-1, 'WHO')).toBe(false);
      });
    });

    it('should default to CDC when chart type not specified', () => {
      expect(isValidAgeForChart(120)).toBe(true);
      expect(isValidAgeForChart(241)).toBe(false);
    });
  });
});
