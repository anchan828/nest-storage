# @anchan828/nest-storage-gcs

## Install

```shell
npm i @anchan828/nest-storage @anchan828/nest-storage-gcs
```

## Usage

```ts
@Module({
  imports: [
    StorageModule.register({
      bucket: "bucket",
      cacheDir: "path/to/cacheDir",
    }),
    GoogleCloudStorageProviderModule.register({
      keyFilename: "path/to/keyfile.json",
    }),
  ],
})
export class AppModule {}
```

```ts
export class Service {
  constructor(private readonly service: StorageService) {}

  public async uploadFile(): Promise<void> {
    const dataPath = "local-path.txt";
    await this.service.upload<GoogleCloudStorageUploadOptions>(dataPath, "path/to/test.txt", { gzip: true });
  }
}
```
