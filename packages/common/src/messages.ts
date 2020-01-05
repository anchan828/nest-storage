export const BUCKET_NOT_DEFINED_MESSAGE = "Buket is not defined. Please set bucket to ModuleOptions or StorageOptions.";

export function FILE_NOT_FOUND(bucket: string, filename: string): string {
  return `File not found: ${JSON.stringify({ bucket, filename })}`;
}
