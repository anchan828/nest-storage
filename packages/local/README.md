# @anchan828/nest-storage-local

## Install

```shell
npm i @anchan828/nest-storage-local
```

## Usage

```ts
LocalStorageModule.register({
  bucket: "bucket",
  dir: dirSync().name,
});
```

```ts
export class Service {
  constructor(private readonly service: LocalStorageService) {}

  public async uploadFile(): Promise<void> {
    const dataPath = "local-path.txt";
    await this.service.upload(dataPath, "path/to/test.txt");
  }
}
```
