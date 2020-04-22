import { StorageOptions } from "@anchan828/nest-storage-common";

export type CompressType = "zip" | "tar" | "tgz";

export interface CompressOptions extends StorageOptions {
  compressType: CompressType;
}

export interface CompressFileEntry {
  filename: string;
  relativePath: string;
}
