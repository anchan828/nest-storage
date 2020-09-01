# @anchan828/nest-storage-s3

## Install

```shell
npm i @anchan828/nest-storage @anchan828/nest-storage-s3
```

## Usage

```ts
StorageModule.register(
  {
    bucket: "bucket",
    cacheDir: "path/to/cacheDir",
  },
  S3ProviderModule.register({
    accessKeyId: "AWSAccessKeyId",
    secretAccessKey: "AWSSecretKey",
  }),
);
```

```ts
export class Service {
  constructor(private readonly service: StorageService) {}

  public async uploadFile(): Promise<void> {
    const dataPath = "local-path.txt";
    await this.service.upload<S3StorageUploadOptions>(dataPath, "path/to/test.txt", { Expires: new Date("2020-1-1") });
  }
}
```
