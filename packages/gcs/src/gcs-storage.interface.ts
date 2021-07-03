import type {
  StorageProviderModuleAsyncOptions,
  StorageProviderModuleOptions,
  StorageProviderModuleOptionsFactory,
  StorageProviderSignedUrlOptions,
} from "@anchan828/nest-storage-common";
import type { StorageOptions as GCSStorageOptions } from "@google-cloud/storage";
export interface GoogleCloudStorageProviderModuleOptions extends StorageProviderModuleOptions, GCSStorageOptions {
  signedUrlOptions?: GoogleCloudStorageProviderSignedUrlOptions;
}
export type GoogleCloudStorageProviderModuleAsyncOptions =
  StorageProviderModuleAsyncOptions<GoogleCloudStorageProviderModuleOptions>;
export type GoogleCloudStorageProviderModuleOptionsFactory =
  StorageProviderModuleOptionsFactory<GoogleCloudStorageProviderModuleOptions>;

export interface GoogleCloudStorageProviderSignedUrlOptions extends StorageProviderSignedUrlOptions {
  /**
   * If you change the endpoint, it will be changed using cname.
   * However, this does not come with a bucket name.
   * https://github.com/googleapis/nodejs-storage/blob/1e0295eebd1120ce6cbcabee4cf1aaa825455d4b/src/signer.ts#L401
   *
   * If you want to run it locally, like fake-gcs-server, you will need a bucket name.
   * This package includes the bucket name by default so that it will work correctly with fake-gcs-server.
   * If you do not want to include the bucket name, set excludeBucketName to true.
   * @type {boolean}
   * @memberof GoogleCloudStorageProviderSignedUrlOptions
   */
  excludeBucketName?: boolean;
}
