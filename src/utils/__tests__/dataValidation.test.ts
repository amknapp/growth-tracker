/**
 * Tests for data validation utilities
 */

import { validateAppData, recoverAppData } from '../dataValidation';
import type { AppData, Child, Measurement } from '../../types';

describe('validateAppData', () => {
  const validChild: Child = {
    id: 'child-1',
    name: 'John Doe',
    birthDate: '2023-01-15',
    sex: 'male',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const validMeasurement: Measurement = {
    id: 'meas-1',
    childId: 'child-1',
    type: 'weight',
    value: 10.5,
    date: '2024-06-01',
    notes: 'Regular checkup',
    createdAt: '2024-06-01T10:00:00.000Z',
  };

  it('should accept valid AppData', () => {
    const data: AppData = {
      children: [validChild],
      measurements: [validMeasurement],
      hasSeenOnboarding: false,
    };

    expect(() => validateAppData(data)).not.toThrow();
    expect(validateAppData(data)).toEqual(data);
  });

  it('should accept empty children and measurements arrays', () => {
    const data: AppData = {
      children: [],
      measurements: [],
    };

    expect(() => validateAppData(data)).not.toThrow();
  });

  it('should reject non-object data', () => {
    expect(() => validateAppData(null)).toThrow('Invalid data structure');
    expect(() => validateAppData(undefined)).toThrow('Invalid data structure');
    expect(() => validateAppData('string')).toThrow('Invalid data structure');
    expect(() => validateAppData(123)).toThrow('Invalid data structure');
  });

  it('should reject data without children array', () => {
    const data = { measurements: [] };
    expect(() => validateAppData(data)).toThrow('children is not an array');
  });

  it('should reject data without measurements array', () => {
    const data = { children: [] };
    expect(() => validateAppData(data)).toThrow('measurements is not an array');
  });

  describe('child validation', () => {
    it('should reject child missing id', () => {
      const data: AppData = {
        children: [{ ...validChild, id: '' } as any],
        measurements: [],
      };
      expect(() => validateAppData(data)).toThrow(
        'Invalid child data at index 0',
      );
    });

    it('should reject child missing name', () => {
      const data: AppData = {
        children: [{ ...validChild, name: '' } as any],
        measurements: [],
      };
      expect(() => validateAppData(data)).toThrow(
        'Invalid child data at index 0',
      );
    });

    it('should reject child with invalid sex', () => {
      const data: AppData = {
        children: [{ ...validChild, sex: 'invalid' } as any],
        measurements: [],
      };
      expect(() => validateAppData(data)).toThrow(
        'Invalid child data at index 0',
      );
    });

    it('should reject child with invalid birthDate format', () => {
      const data: AppData = {
        children: [{ ...validChild, birthDate: '01-15-2023' }],
        measurements: [],
      };
      expect(() => validateAppData(data)).toThrow(
        'Invalid child data at index 0',
      );
    });

    it('should reject child with invalid createdAt', () => {
      const data: AppData = {
        children: [{ ...validChild, createdAt: 'invalid-date' }],
        measurements: [],
      };
      expect(() => validateAppData(data)).toThrow(
        'Invalid child data at index 0',
      );
    });
  });

  describe('measurement validation', () => {
    it('should reject measurement missing id', () => {
      const data: AppData = {
        children: [validChild],
        measurements: [{ ...validMeasurement, id: '' } as any],
      };
      expect(() => validateAppData(data)).toThrow(
        'Invalid measurement data at index 0',
      );
    });

    it('should reject measurement missing childId', () => {
      const data: AppData = {
        children: [validChild],
        measurements: [{ ...validMeasurement, childId: '' } as any],
      };
      expect(() => validateAppData(data)).toThrow(
        'Invalid measurement data at index 0',
      );
    });

    it('should reject measurement with invalid type', () => {
      const data: AppData = {
        children: [validChild],
        measurements: [{ ...validMeasurement, type: 'invalid' } as any],
      };
      expect(() => validateAppData(data)).toThrow(
        'Invalid measurement data at index 0',
      );
    });

    it('should reject measurement with value below minimum', () => {
      const data: AppData = {
        children: [validChild],
        measurements: [{ ...validMeasurement, value: 0.05 }], // Below 0.1kg min
      };
      expect(() => validateAppData(data)).toThrow(
        'Invalid measurement data at index 0',
      );
    });

    it('should reject measurement with value above maximum', () => {
      const data: AppData = {
        children: [validChild],
        measurements: [{ ...validMeasurement, value: 350 }], // Above 300kg max
      };
      expect(() => validateAppData(data)).toThrow(
        'Invalid measurement data at index 0',
      );
    });

    it('should accept valid height measurements', () => {
      const data: AppData = {
        children: [validChild],
        measurements: [
          { ...validMeasurement, type: 'height', value: 75 }, // 75cm valid
        ],
      };
      expect(() => validateAppData(data)).not.toThrow();
    });

    it('should reject height below minimum', () => {
      const data: AppData = {
        children: [validChild],
        measurements: [
          { ...validMeasurement, type: 'height', value: 15 }, // Below 20cm
        ],
      };
      expect(() => validateAppData(data)).toThrow(
        'Invalid measurement data at index 0',
      );
    });

    it('should reject height above maximum', () => {
      const data: AppData = {
        children: [validChild],
        measurements: [
          { ...validMeasurement, type: 'height', value: 260 }, // Above 250cm
        ],
      };
      expect(() => validateAppData(data)).toThrow(
        'Invalid measurement data at index 0',
      );
    });

    it('should accept valid head circumference measurements', () => {
      const data: AppData = {
        children: [validChild],
        measurements: [
          { ...validMeasurement, type: 'headCircumference', value: 45 },
        ],
      };
      expect(() => validateAppData(data)).not.toThrow();
    });

    it('should reject head circumference below minimum', () => {
      const data: AppData = {
        children: [validChild],
        measurements: [
          { ...validMeasurement, type: 'headCircumference', value: 15 }, // Below 20cm
        ],
      };
      expect(() => validateAppData(data)).toThrow(
        'Invalid measurement data at index 0',
      );
    });

    it('should reject head circumference above maximum', () => {
      const data: AppData = {
        children: [validChild],
        measurements: [
          { ...validMeasurement, type: 'headCircumference', value: 110 }, // Above 100cm
        ],
      };
      expect(() => validateAppData(data)).toThrow(
        'Invalid measurement data at index 0',
      );
    });

    it('should reject measurement with invalid date format', () => {
      const data: AppData = {
        children: [validChild],
        measurements: [{ ...validMeasurement, date: '06-01-2024' }],
      };
      expect(() => validateAppData(data)).toThrow(
        'Invalid measurement data at index 0',
      );
    });

    it('should accept measurement with undefined notes', () => {
      const data: AppData = {
        children: [validChild],
        measurements: [{ ...validMeasurement, notes: undefined }],
      };
      expect(() => validateAppData(data)).not.toThrow();
    });

    it('should reject measurement with non-string notes', () => {
      const data: AppData = {
        children: [validChild],
        measurements: [{ ...validMeasurement, notes: 123 } as any],
      };
      expect(() => validateAppData(data)).toThrow(
        'Invalid measurement data at index 0',
      );
    });
  });
});

describe('recoverAppData', () => {
  const validChild: Child = {
    id: 'child-1',
    name: 'John Doe',
    birthDate: '2023-01-15',
    sex: 'male',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const validMeasurement: Measurement = {
    id: 'meas-1',
    childId: 'child-1',
    type: 'weight',
    value: 10.5,
    date: '2024-06-01',
    createdAt: '2024-06-01T10:00:00.000Z',
  };

  it('should return valid data unchanged', () => {
    const data: AppData = {
      children: [validChild],
      measurements: [validMeasurement],
      hasSeenOnboarding: true,
    };

    const result = recoverAppData(data);
    expect(result).toEqual(data);
  });

  it('should filter out invalid children during recovery', () => {
    const invalidChild = { ...validChild, id: '' }; // Missing id makes data invalid
    const data: any = {
      children: [validChild, invalidChild],
      measurements: [validMeasurement],
    };

    // This data structure is invalid, so recoverAppData will attempt recovery
    const result = recoverAppData(data);
    expect(result.children).toHaveLength(1);
    expect(result.children[0].id).toBe('child-1');
    expect(result.measurements).toHaveLength(1);
  });

  it('should filter out invalid measurements during recovery', () => {
    const invalidMeasurement = { ...validMeasurement, value: -5 }; // Invalid value makes data invalid
    const data: any = {
      children: [validChild],
      measurements: [validMeasurement, invalidMeasurement],
    };

    // This data structure is invalid, so recoverAppData will attempt recovery
    const result = recoverAppData(data);
    expect(result.measurements).toHaveLength(1);
    expect(result.measurements[0].id).toBe('meas-1');
  });

  it('should remove orphaned measurements during recovery (no matching child)', () => {
    const orphanedMeasurement = {
      ...validMeasurement,
      id: 'meas-2',
      childId: 'nonexistent-child',
    };
    // Add an invalid child to trigger recovery path
    const invalidChild = { ...validChild, id: '' };
    const data: any = {
      children: [validChild, invalidChild],
      measurements: [validMeasurement, orphanedMeasurement],
    };

    const result = recoverAppData(data);
    expect(result.measurements).toHaveLength(1);
    expect(result.measurements[0].childId).toBe('child-1');
  });

  it('should handle completely corrupted data', () => {
    const data: any = {
      children: [{ invalid: 'data' }, null, undefined],
      measurements: [{ invalid: 'measurement' }, null],
    };

    const result = recoverAppData(data);
    expect(result.children).toHaveLength(0);
    expect(result.measurements).toHaveLength(0);
  });

  it('should return empty arrays for missing arrays', () => {
    const data: any = {};

    const result = recoverAppData(data);
    expect(result.children).toEqual([]);
    expect(result.measurements).toEqual([]);
  });

  it('should handle non-array children', () => {
    const data: any = {
      children: 'not-an-array',
      measurements: [validMeasurement],
    };

    const result = recoverAppData(data);
    expect(result.children).toEqual([]);
    expect(result.measurements).toEqual([]);
  });

  it('should handle non-array measurements', () => {
    const data: any = {
      children: [validChild],
      measurements: 'not-an-array',
    };

    const result = recoverAppData(data);
    expect(result.measurements).toEqual([]);
  });

  it('should handle mixed valid and invalid data during recovery', () => {
    const invalidChild1 = { ...validChild, id: 'child-2', sex: 'invalid' };
    const invalidChild2 = { ...validChild, id: 'child-3', name: '' };
    const validChild2 = { ...validChild, id: 'child-4', name: 'Jane Doe' };

    const invalidMeasurement1 = {
      ...validMeasurement,
      id: 'meas-2',
      value: 400,
    };
    const validMeasurement2 = {
      ...validMeasurement,
      id: 'meas-3',
      childId: 'child-4',
    };
    const orphanedMeasurement = {
      ...validMeasurement,
      id: 'meas-4',
      childId: 'nonexistent',
    };

    const data: any = {
      children: [validChild, invalidChild1, invalidChild2, validChild2],
      measurements: [
        validMeasurement,
        invalidMeasurement1,
        validMeasurement2,
        orphanedMeasurement,
      ],
    };

    // Data structure is invalid due to invalidChild1, invalidChild2, and invalidMeasurement1
    const result = recoverAppData(data);

    // Should keep 2 valid children
    expect(result.children).toHaveLength(2);
    expect(result.children.map(c => c.id)).toContain('child-1');
    expect(result.children.map(c => c.id)).toContain('child-4');

    // Should keep 2 valid measurements (orphaned filtered out)
    expect(result.measurements).toHaveLength(2);
    expect(result.measurements.map(m => m.id)).toContain('meas-1');
    expect(result.measurements.map(m => m.id)).toContain('meas-3');
  });
});
