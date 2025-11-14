/**
 * CSV Export Tests
 */

import {
  filterMeasurementsByChild,
  generateCSVFilename,
  generateMeasurementCSV,
} from '../csvExport';
import { Child, Measurement } from '../../types';

describe('CSV Export Utility', () => {
  const mockChildren: Child[] = [
    {
      id: 'child-1',
      name: 'Alice Johnson',
      birthDate: '2020-01-15',
      sex: 'female',
      createdAt: '2020-01-15T10:00:00.000Z',
      updatedAt: '2020-01-15T10:00:00.000Z',
    },
    {
      id: 'child-2',
      name: 'Bob Smith',
      birthDate: '2018-06-20',
      sex: 'male',
      createdAt: '2018-06-20T10:00:00.000Z',
      updatedAt: '2018-06-20T10:00:00.000Z',
    },
  ];

  const mockMeasurements: Measurement[] = [
    {
      id: 'measure-1',
      childId: 'child-1',
      date: '2023-01-15',
      type: 'weight',
      value: 12.5,
      notes: 'Regular checkup',
      createdAt: '2023-01-15T10:00:00.000Z',
    },
    {
      id: 'measure-2',
      childId: 'child-1',
      date: '2023-01-15',
      type: 'height',
      value: 85.0,
      createdAt: '2023-01-15T10:05:00.000Z',
    },
    {
      id: 'measure-3',
      childId: 'child-2',
      date: '2023-02-10',
      type: 'weight',
      value: 18.3,
      notes: 'After illness',
      createdAt: '2023-02-10T14:30:00.000Z',
    },
  ];

  describe('generateMeasurementCSV', () => {
    it('should generate CSV with all measurements', () => {
      const csv = generateMeasurementCSV(mockMeasurements, mockChildren);

      expect(csv).toContain('Child Name');
      expect(csv).toContain('Date');
      expect(csv).toContain('Type');
      expect(csv).toContain('Value');
      expect(csv).toContain('Unit');
      expect(csv).toContain('Notes');
      expect(csv).toContain('Created At');

      expect(csv).toContain('Alice Johnson');
      expect(csv).toContain('Bob Smith');
      expect(csv).toContain('Weight');
      expect(csv).toContain('Height');
      expect(csv).toContain('12.5');
      expect(csv).toContain('85');
      expect(csv).toContain('18.3');
      expect(csv).toContain('kg');
      expect(csv).toContain('cm');
    });

    it('should include notes when present', () => {
      const csv = generateMeasurementCSV(mockMeasurements, mockChildren);

      expect(csv).toContain('Regular checkup');
      expect(csv).toContain('After illness');
    });

    it('should sort measurements by date and created time', () => {
      const csv = generateMeasurementCSV(mockMeasurements, mockChildren);
      const lines = csv.split('\n').filter(line => line.trim() !== '');

      // First data row should be from 2023-01-15 (earliest date)
      expect(lines[1]).toContain('2023-01-15');
      // Last data row should be from 2023-02-10 (latest date)
      expect(lines[lines.length - 1]).toContain('2023-02-10');
    });

    it('should handle measurements with unknown child', () => {
      const measurementsWithUnknown: Measurement[] = [
        {
          id: 'measure-4',
          childId: 'unknown-child',
          date: '2023-03-01',
          type: 'weight',
          value: 10.0,
          createdAt: '2023-03-01T10:00:00.000Z',
        },
      ];

      const csv = generateMeasurementCSV(measurementsWithUnknown, mockChildren);

      expect(csv).toContain('Unknown');
    });

    it('should format measurement types correctly', () => {
      const csv = generateMeasurementCSV(mockMeasurements, mockChildren);

      expect(csv).toContain('Weight');
      expect(csv).toContain('Height');
      expect(csv).not.toContain('weight');
      expect(csv).not.toContain('height');
    });
  });

  describe('generateCSVFilename', () => {
    it('should generate filename with child name and date', () => {
      const filename = generateCSVFilename('Alice Johnson');

      expect(filename).toContain('growth_tracker_');
      expect(filename).toContain('Alice_Johnson');
      expect(filename).toContain('.csv');
      // Should contain date in YYYY-MM-DD format
      expect(filename).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should generate filename without child name', () => {
      const filename = generateCSVFilename();

      expect(filename).toContain('growth_tracker_');
      expect(filename).toContain('all_children');
      expect(filename).toContain('.csv');
    });

    it('should sanitize special characters in child name', () => {
      const filename = generateCSVFilename('Alice & Bob O\'Connor');

      expect(filename).toContain('Alice___Bob_O_Connor');
      expect(filename).not.toContain('&');
      expect(filename).not.toContain("'");
    });
  });

  describe('filterMeasurementsByChild', () => {
    it('should filter measurements for specific child', () => {
      const filtered = filterMeasurementsByChild(mockMeasurements, 'child-1');

      expect(filtered).toHaveLength(2);
      expect(filtered[0].childId).toBe('child-1');
      expect(filtered[1].childId).toBe('child-1');
    });

    it('should return empty array for child with no measurements', () => {
      const filtered = filterMeasurementsByChild(mockMeasurements, 'child-3');

      expect(filtered).toHaveLength(0);
    });

    it('should not modify original array', () => {
      const originalLength = mockMeasurements.length;
      filterMeasurementsByChild(mockMeasurements, 'child-1');

      expect(mockMeasurements).toHaveLength(originalLength);
    });
  });
});
