/**
 * Validation utilities for printer data
 * Provides type guards and validation functions for PrinterItem interface
 */

import {
  PrinterItem,
  PrinterAttributes,
  PrintInfo,
  FileTransferInfo,
  PrinterStatus,
  PrinterData,
} from 'types/PrinterTypes';

// Helper function to check if a value is a valid string
function isValidString(value: unknown): value is string {
  return typeof value === 'string';
}

// Helper function to check if a value is a valid number
function isValidNumber(value: unknown): value is number {
  return (
    typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value)
  );
}

// Helper function to check if a value is a valid array
function isValidArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

// Helper function to check if a value is a valid object
function isValidObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// Validate PrinterAttributes - accept partial data with critical fields
function hasValidAttributes(
  attributes: unknown
): attributes is PrinterAttributes {
  if (!isValidObject(attributes)) {
    return false;
  }

  const attrs = attributes as Record<string, unknown>;

  // Critical field: MainboardID must be a valid string
  if (!isValidString(attrs.MainboardID)) {
    return false;
  }

  // Optional fields: accept if present and valid, ignore if missing
  const optionalStringFields = [
    'Name',
    'MachineName',
    'ProtocolVersion',
    'FirmwareVersion',
    'Resolution',
    'MainboardIP',
    'LocalSDCPAddress',
    'SDCPAddress',
  ];
  const optionalNumberFields = ['SDCPStatus'];
  const optionalArrayFields = ['Capabilities'];

  // Validate optional string fields
  for (let i = 0; i < optionalStringFields.length; i++) {
    const field = optionalStringFields[i];
    if (attrs[field] !== undefined && !isValidString(attrs[field])) {
      return false;
    }
  }

  // Validate optional number fields
  for (let i = 0; i < optionalNumberFields.length; i++) {
    const field = optionalNumberFields[i];
    if (attrs[field] !== undefined && !isValidNumber(attrs[field])) {
      return false;
    }
  }

  // Validate optional array fields
  for (let i = 0; i < optionalArrayFields.length; i++) {
    const field = optionalArrayFields[i];
    if (attrs[field] !== undefined && !isValidArray(attrs[field])) {
      return false;
    }
  }

  return true;
}

// Validate PrintInfo - accept partial data with critical fields
function hasValidPrintInfo(printInfo: unknown): printInfo is PrintInfo {
  if (!isValidObject(printInfo)) {
    return false;
  }

  const info = printInfo as Record<string, unknown>;

  // Critical fields: must be valid numbers if present
  const criticalNumberFields = [
    'Status',
    'CurrentLayer',
    'TotalLayer',
    'CurrentTicks',
    'TotalTicks',
    'ErrorNumber',
  ];

  for (let i = 0; i < criticalNumberFields.length; i++) {
    const field = criticalNumberFields[i];
    if (info[field] !== undefined && !isValidNumber(info[field])) {
      return false;
    }
  }

  // Optional field: Filename must be string if present
  if (info.Filename !== undefined && !isValidString(info.Filename)) {
    return false;
  }

  return true;
}

// Validate FileTransferInfo - accept partial data
function hasValidFileTransferInfo(
  transferInfo: unknown
): transferInfo is FileTransferInfo {
  if (!isValidObject(transferInfo)) {
    return false;
  }

  const info = transferInfo as Record<string, unknown>;

  // All fields are optional but must be valid types if present
  const numberFields = [
    'Status',
    'DownloadOffset',
    'CheckOffset',
    'FileTotalSize',
  ];
  const stringFields = ['Filename'];

  // Validate number fields
  for (let i = 0; i < numberFields.length; i++) {
    const field = numberFields[i];
    if (info[field] !== undefined && !isValidNumber(info[field])) {
      return false;
    }
  }

  // Validate string fields
  for (let i = 0; i < stringFields.length; i++) {
    const field = stringFields[i];
    if (info[field] !== undefined && !isValidString(info[field])) {
      return false;
    }
  }

  return true;
}

// Validate PrinterStatus
function hasValidPrinterStatus(status: unknown): status is PrinterStatus {
  if (!isValidObject(status)) {
    return false;
  }

  const statusObj = status as Record<string, unknown>;

  // Critical fields: must be valid numbers
  const criticalNumberFields = ['CurrentStatus', 'PreviousStatus'];
  for (let i = 0; i < criticalNumberFields.length; i++) {
    const field = criticalNumberFields[i];
    if (!isValidNumber(statusObj[field])) {
      return false;
    }
  }

  // Validate nested objects if present
  if (
    statusObj.PrintInfo !== undefined &&
    !hasValidPrintInfo(statusObj.PrintInfo)
  ) {
    return false;
  }

  if (
    statusObj.FileTransferInfo !== undefined &&
    !hasValidFileTransferInfo(statusObj.FileTransferInfo)
  ) {
    return false;
  }

  return true;
}

// Validate PrinterData
function hasValidPrinterData(data: unknown): data is PrinterData {
  if (!isValidObject(data)) {
    return false;
  }

  const printerData = data as Record<string, unknown>;

  // Critical: Attributes must be valid
  if (!hasValidAttributes(printerData.Attributes)) {
    return false;
  }

  // Critical: Status must be valid if present
  if (
    printerData.Status !== undefined &&
    !hasValidPrinterStatus(printerData.Status)
  ) {
    return false;
  }

  return true;
}

// Main validation function for PrinterItem
export function isValidPrinterItem(data: unknown): data is PrinterItem {
  if (!isValidObject(data)) {
    return false;
  }

  const printerItem = data as Record<string, unknown>;

  // Critical field: Id must be a valid string
  if (!isValidString(printerItem.Id)) {
    return false;
  }

  // Critical field: Data must be valid
  if (!hasValidPrinterData(printerItem.Data)) {
    return false;
  }

  return true;
}

// Helper function to check basic structure (less strict)
export function hasValidBasicStructure(data: unknown): boolean {
  if (!isValidObject(data)) {
    return false;
  }

  const obj = data as Record<string, unknown>;
  return isValidString(obj.Id) && isValidObject(obj.Data);
}

// Helper function to extract critical fields safely
export function extractCriticalFields(
  data: unknown
): { id?: string; mainboardId?: string } | null {
  if (!isValidObject(data)) {
    return null;
  }

  const obj = data as Record<string, unknown>;
  const id = isValidString(obj.Id) ? obj.Id : undefined;

  let mainboardId;
  if (isValidObject(obj.Data)) {
    const dataObj = obj.Data as Record<string, unknown>;
    mainboardId =
      isValidObject(dataObj.Attributes) &&
      isValidString((dataObj.Attributes as Record<string, unknown>).MainboardID)
        ? (dataObj.Attributes as Record<string, unknown>).MainboardID
        : undefined;
  }

  return { id, mainboardId: mainboardId as string | undefined };
}
