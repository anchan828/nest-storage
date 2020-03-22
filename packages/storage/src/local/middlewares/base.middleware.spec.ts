import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { StorageModule } from "../../storage.module";
import { StorageService } from "../../storage.service";
describe("StorageBaseMiddleware", () => {
  let app: INestApplication;
  let service: StorageService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [StorageModule.register({ bucket: "bucket" })],
    }).compile();
    service = module.get<StorageService>(StorageService);
    app = await module.createNestApplication(undefined, { bodyParser: false });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });
  it("should throw action error", async () => {
    const url = await service.getSignedUrl("test.txt", { action: "download" });
    await request(app.getHttpServer()).put(url).attach("file", Buffer.from("test"), "test.txt").expect(400, {
      error: "Bad Request",
      message: "Invalid action 'download'. action should be 'upload'",
      statusCode: 400,
    });
  });

  it("should throw bucket error", async () => {
    const url = await service.getSignedUrl("test.txt", { action: "upload" });

    await request(app.getHttpServer())
      .put(url.replace("/bucket/", "/invalid/"))
      .attach("file", Buffer.from("test"), "test.txt")
      .expect(400, {
        error: "Bad Request",
        message: "Invalid bucket 'invalid'",
        statusCode: 400,
      });
  });

  it("should throw filename error", async () => {
    const url = await service.getSignedUrl("test.txt", { action: "upload" });
    await request(app.getHttpServer())
      .put(url.replace("test.txt", "invalid.txt"))
      .attach("file", Buffer.from("test"), "test.txt")
      .expect(400, {
        error: "Bad Request",
        message: "Invalid filename 'invalid.txt'",
        statusCode: 400,
      });
  });
});
