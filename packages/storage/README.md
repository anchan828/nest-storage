# @anchan828/nest-storage

## Install

```shell
npm i @anchan828/nest-storage
```

## Usage

```ts
StorageModule.register({
  bucket: "bucket",
  cacheDir: "path/to/cacheDir",
});
```

```ts
export class Service {
  constructor(private readonly service: StorageService) {}

  public async uploadFile(): Promise<void> {
    const dataPath = "local-path.txt";
    await this.service.upload(dataPath, "path/to/test.txt");
  }
}
```

## Storage providers

You can set custom storage provider. Default is LocalStorage

```ts
StorageModule.register({
  bucket: "bucket",
  cacheDir: "path/to/cacheDir",
  storage: LocalStorage,
});
```

| Provider             | Pakcage                                                                                  |
| :------------------- | :--------------------------------------------------------------------------------------- |
| Google Cloud Storage | [@anchan828/nest-storage-gcs](https://www.npmjs.com/package/@anchan828/nest-storage-gcs) |
