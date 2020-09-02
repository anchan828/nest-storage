import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { StorageModule } from "../../storage/src/storage.module";
import { LocalStorageProviderModule } from "./local.module";
describe("LocalStorageProviderModule", () => {
  let app: INestApplication;

  it("should set middlewares", async () => {
    const module = await Test.createTestingModule({
      imports: [StorageModule.register({ bucket: "bucket" }, LocalStorageProviderModule.register())],
    }).compile();
    app = module.createNestApplication(undefined, { bodyParser: false });
    await app.init();
    await app.close();
  });

  it("should set middlewares", async () => {
    const module = await Test.createTestingModule({
      imports: [
        StorageModule.registerAsync(
          { useFactory: () => ({ bucket: "bucket" }) },
          LocalStorageProviderModule.registerAsync({ useFactory: () => ({}) }),
        ),
      ],
    }).compile();
    app = module.createNestApplication(undefined, { bodyParser: false });
    await app.init();
    await app.close();
  });
});
