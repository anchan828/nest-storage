import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { StorageModule } from "../../storage.module";
import { StorageService } from "../../storage.service";
describe("StorageDownloadMiddleware", () => {
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

  it("should throw error if file not found", async () => {
    const url = await service.getSignedUrl("download-not-found-test.txt", { action: "download" });
    await request(app.getHttpServer())
      .get(url)
      .expect(400, {
        error: "Bad Request",
        message: `File not found: {"bucket":"bucket","filename":"download-not-found-test.txt"}`,
        statusCode: 400,
      });
  });

  it("should download file", async () => {
    let url = await service.getSignedUrl("path/to/download-test.txt", { action: "upload" });
    await request(app.getHttpServer())
      .put(url)
      .attach("file", Buffer.from("test"), "test.txt")
      .expect(204);

    url = await service.getSignedUrl("path/to/download-test.txt", { action: "download" });

    await request(app.getHttpServer())
      .get(url)
      .expect(200);
  });
});
