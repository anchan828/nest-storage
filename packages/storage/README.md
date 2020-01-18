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
| Amazon S3            | [@anchan828/nest-storage-s3](https://www.npmjs.com/package/@anchan828/nest-storage-s3)   |

## Signed URL

You can get signed URL

```ts
await this.service.getSignedUrl(filename, {
  action: "upload" | "download" | "delete",
  // Milliseconds. default is 900000 = 15 mins
  expires: number,
});
// => /_signed_url/bucket/test.txt?signature=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3Rpb24iOiJ1cGxvYWQiLCJleHBpcmVzIjo5MDAwMDAsImJ1Y2tldCI6ImJ1Y2tldCIsImZpbGVuYW1lIjoidGVzdC50eHQiLCJpYXQiOjE1NzkzMjM2MTYsImV4cCI6MTU4MDIyMzYxNn0.iJfq01VBExCvlGhKcT8hQ9d2lGTLW4miiACX3sG5HO8
```
