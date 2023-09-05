export interface PrinterAttributes {
  Name: string;
  MachineName: string;
  ProtocolVersion: string;
  FirmwareVersion: string;
  Resolution: string;
  MainboardIP: string;
  MainboardID: string;
  SDCPStatus: number;
  LocalSDCPAddress: string;
  SDCPAddress: string;
  Capabilities: string[];
}

export interface PrintInfo {
  Status: number;
  CurrentLayer: number;
  TotalLayer: number;
  CurrentTicks: number;
  TotalTicks: number;
  ErrorNumber: number;
  Filename: string;
}

export interface FileTransferInfo {
  Status: number;
  DownloadOffset: number;
  CheckOffset: number;
  FileTotalSize: number;
  Filename: string;
}

export interface PrinterStatus {
  CurrentStatus: number;
  PreviousStatus: number;
  PrintInfo: PrintInfo;
  FileTransferInfo: FileTransferInfo;
}

export interface PrinterData {
  Attributes: PrinterAttributes;
  Status: PrinterStatus;
}

export interface PrinterItem {
  Id: string;
  Data: PrinterData;
}
