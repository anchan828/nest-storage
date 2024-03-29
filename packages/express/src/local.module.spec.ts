import type { INestApplication } from "@nestjs/common";
import { ExpressAdapter } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import { StorageModule } from "../../storage/src/storage.module";
import { LocalStorageProviderModule } from "./local.module";
describe("LocalStorageProviderModule", () => {
  let app: INestApplication;

  it("should set middlewares (register - register)", async () => {
    const module = await Test.createTestingModule({
      imports: [StorageModule.register({ bucket: "bucket" }), LocalStorageProviderModule.register()],
    }).compile();
    app = module.createNestApplication(new ExpressAdapter(), { bodyParser: false });
    await app.init();
    await app.close();
  });

  it("should set middlewares (register - registerAsync)", async () => {
    const module = await Test.createTestingModule({
      imports: [
        StorageModule.register({ bucket: "bucket" }),
        LocalStorageProviderModule.registerAsync({ useFactory: () => ({}) }),
      ],
    }).compile();
    app = module.createNestApplication(new ExpressAdapter(), { bodyParser: false });
    await app.init();
    await app.close();
  });

  it("should set middlewares (registerAsync - registerAsync)", async () => {
    const module = await Test.createTestingModule({
      imports: [
        StorageModule.registerAsync({ useFactory: () => ({ bucket: "bucket" }) }),
        LocalStorageProviderModule.registerAsync({ useFactory: () => ({}) }),
      ],
    }).compile();
    app = module.createNestApplication(new ExpressAdapter(), { bodyParser: false });
    await app.init();
    await app.close();
  });

  it("should set middlewares (registerAsync - register)", async () => {
    const module = await Test.createTestingModule({
      imports: [
        StorageModule.registerAsync({ useFactory: () => ({ bucket: "bucket" }) }),
        LocalStorageProviderModule.register({}),
      ],
    }).compile();
    app = module.createNestApplication(new ExpressAdapter(), { bodyParser: false });
    await app.init();
    await app.close();
  });
});
