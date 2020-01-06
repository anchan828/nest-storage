# @anchan828/nest-storage-gcs

## Install

```shell
npm i @anchan828/nest-storage-gcs
```

## Usage

```ts
GoogleCloudStorageModule.register({
  bucket: "bucket",
  cacheDir: "path/to/cacheDir",
  keyFilename: "path/to/keyfile.json",
});
```

```ts
export class Service {
  constructor(private readonly service: GoogleCloudStorageService) {}

  public async uploadFile(): Promise<void> {
    const dataPath = "local-path.txt";
    await this.service.upload(dataPath, "path/to/test.txt");
  }
}
```
