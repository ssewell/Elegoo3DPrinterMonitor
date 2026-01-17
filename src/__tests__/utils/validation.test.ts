/**
 * Test file for validation utilities
 * This file tests the validation logic for printer data
 */

import {
  MALFORMED_JSON_SAMPLES,
  INVALID_PRINTER_DATA,
  PARTIAL_PRINTER_DATA,
  VALID_PRINTER_DATA,
} from '../../testUtils/testUtils';
import {
  isValidPrinterItem,
  hasValidBasicStructure,
  extractCriticalFields,
} from '../../utils/validation';

describe('Validation Utilities', () => {
  describe('isValidPrinterItem', () => {
    it('should accept valid complete printer data', () => {
      expect(isValidPrinterItem(VALID_PRINTER_DATA)).toBe(true);
    });

    it('should accept valid partial printer data', () => {
      PARTIAL_PRINTER_DATA.forEach((data) => {
        expect(isValidPrinterItem(data)).toBe(true);
      });
    });

    it('should reject malformed JSON samples', () => {
      MALFORMED_JSON_SAMPLES.forEach((data) => {
        expect(isValidPrinterItem(data)).toBe(false);
      });
    });

    it('should reject invalid printer data structures', () => {
      INVALID_PRINTER_DATA.forEach((data) => {
        expect(isValidPrinterItem(data)).toBe(false);
      });
    });

    it('should reject null and undefined', () => {
      expect(isValidPrinterItem(null)).toBe(false);
      expect(isValidPrinterItem(undefined)).toBe(false);
    });

    it('should reject non-object types', () => {
      expect(isValidPrinterItem('string')).toBe(false);
      expect(isValidPrinterItem(123)).toBe(false);
      expect(isValidPrinterItem([])).toBe(false);
    });

    it('should reject printer data without critical Id field', () => {
      const dataWithoutId = {
        Data: VALID_PRINTER_DATA.Data,
      };
      expect(isValidPrinterItem(dataWithoutId)).toBe(false);
    });

    it('should reject printer data without valid Id', () => {
      const invalidIdData = {
        Id: null,
        Data: VALID_PRINTER_DATA.Data,
      };
      expect(isValidPrinterItem(invalidIdData)).toBe(false);
    });

    it('should reject printer data without Data field', () => {
      const dataWithoutData = {
        Id: VALID_PRINTER_DATA.Id,
      };
      expect(isValidPrinterItem(dataWithoutData)).toBe(false);
    });

    it('should reject printer data without MainboardID', () => {
      const dataWithoutMainboardId = {
        Id: VALID_PRINTER_DATA.Id,
        Data: {
          Attributes: {
            Name: 'Test',
          },
        },
      };
      expect(isValidPrinterItem(dataWithoutMainboardId)).toBe(false);
    });

    it('should reject printer data with invalid MainboardID type', () => {
      const dataWithInvalidMainboardId = {
        Id: VALID_PRINTER_DATA.Id,
        Data: {
          Attributes: {
            MainboardID: 123,
          },
        },
      };
      expect(isValidPrinterItem(dataWithInvalidMainboardId)).toBe(false);
    });
  });

  describe('hasValidBasicStructure', () => {
    it('should accept valid basic structure', () => {
      expect(hasValidBasicStructure(VALID_PRINTER_DATA)).toBe(true);
    });

    it('should accept partial valid structure', () => {
      const partialData = {
        Id: 'test-id',
        Data: {
          Attributes: {},
        },
      };
      expect(hasValidBasicStructure(partialData)).toBe(true);
    });

    it('should reject invalid structures', () => {
      expect(hasValidBasicStructure(null)).toBe(false);
      expect(hasValidBasicStructure(undefined)).toBe(false);
      expect(hasValidBasicStructure({})).toBe(false);
      expect(hasValidBasicStructure({ Id: 'test' })).toBe(false);
      expect(hasValidBasicStructure({ Data: {} })).toBe(false);
    });
  });

  describe('extractCriticalFields', () => {
    it('should extract valid critical fields', () => {
      const result = extractCriticalFields(VALID_PRINTER_DATA);
      expect(result).toEqual({
        id: 'f25273b12b094c5a8b9513a30ca60049',
        mainboardId: 'MB001',
      });
    });

    it('should handle missing critical fields gracefully', () => {
      const partialData = {
        Id: 'test-id',
        Data: {
          Attributes: {
            Name: 'Test',
          },
        },
      };
      const result = extractCriticalFields(partialData);
      expect(result).toEqual({
        id: 'test-id',
        mainboardId: undefined,
      });
    });

    it('should return null for invalid data', () => {
      expect(extractCriticalFields(null)).toBe(null);
      expect(extractCriticalFields(undefined)).toBe(null);
      expect(extractCriticalFields('invalid')).toBe(null);
    });

    it('should handle deeply nested invalid data', () => {
      const invalidNestedData = {
        Id: 'test-id',
        Data: {
          Attributes: null,
        },
      };
      const result = extractCriticalFields(invalidNestedData);
      expect(result).toEqual({
        id: 'test-id',
        mainboardId: undefined,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings as valid strings', () => {
      const emptyStringData = {
        Id: '',
        Data: {
          Attributes: {
            MainboardID: '',
          },
        },
      };
      expect(isValidPrinterItem(emptyStringData)).toBe(true);
    });

    it('should handle zero as valid numbers', () => {
      const zeroData = {
        Id: 'test',
        Data: {
          Attributes: {
            MainboardID: 'test',
          },
          Status: {
            CurrentStatus: 0,
            PreviousStatus: 0,
            PrintInfo: {
              Status: 0,
              CurrentLayer: 0,
              TotalLayer: 0,
              CurrentTicks: 0,
              TotalTicks: 0,
              ErrorNumber: 0,
            },
          },
        },
      };
      expect(isValidPrinterItem(zeroData)).toBe(true);
    });

    it('should reject NaN and Infinity', () => {
      const nanData = {
        Id: 'test',
        Data: {
          Attributes: {
            MainboardID: 'test',
          },
          Status: {
            CurrentStatus: NaN,
            PreviousStatus: 0,
          },
        },
      };
      expect(isValidPrinterItem(nanData)).toBe(false);

      const infinityData = {
        Id: 'test',
        Data: {
          Attributes: {
            MainboardID: 'test',
          },
          Status: {
            CurrentStatus: Infinity,
            PreviousStatus: 0,
          },
        },
      };
      expect(isValidPrinterItem(infinityData)).toBe(false);
    });

    it('should accept empty arrays for capabilities', () => {
      const emptyArrayData = {
        Id: 'test',
        Data: {
          Attributes: {
            MainboardID: 'test',
            Capabilities: [],
          },
        },
      };
      expect(isValidPrinterItem(emptyArrayData)).toBe(true);
    });
  });
});
