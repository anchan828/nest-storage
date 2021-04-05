# @anchan828/nest-storage-express

## Install

```shell
npm i @anchan828/nest-storage-express
```

## Usage

```typescript
@Module({
  imports: [
    StorageModule.register({
      bucket: "bucket",
      cacheDir: "path/to/cacheDir",
    }),
    LocalStorageProviderModule.register(),
  ],
})
export class AppModule {}
```
