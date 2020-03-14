import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { createReadStream, writeFileSync } from "fs";
import * as request from "supertest";
import { tmpNameSync } from "tmp";
import { StorageModule } from "../../storage.module";
import { StorageService } from "../../storage.service";

describe("StorageUploadMiddleware", () => {
  let app: INestApplication;
  let service: StorageService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [StorageModule.register({ bucket: "bucket" })],
    }).compile();
    app = module.createNestApplication(undefined, { bodyParser: false });
    await app.init();
    service = await app.resolve<StorageService>(StorageService);
  });

  afterEach(async () => {
    await app.close();
  });

  it("should throw error", async () => {
    const url = await service.getSignedUrl("test.txt", { action: "upload" });

    await request(app.getHttpServer())
      .put(url)
      .expect(400, {
        error: "The file was not uploaded",
        message: "Bad Request",
        statusCode: 400,
      });
  });

  it("should throw file error", async () => {
    const url = await service.getSignedUrl("test.txt", { action: "upload" });
    await request(app.getHttpServer())
      .put(url)
      .expect(400, {
        error: "The file was not uploaded",
        message: "Bad Request",
        statusCode: 400,
      });
  });

  it("should upload file", async () => {
    let url = await service.getSignedUrl("test.txt", { action: "upload" });
    await request(app.getHttpServer())
      .put(url)
      .attach("file", Buffer.from("test"), "test.txt")
      .expect(204);

    url = await service.getSignedUrl("path/to/test.txt", { action: "upload" });

    await request(app.getHttpServer())
      .put(url)
      .attach("file", Buffer.from("test"), "test.txt")
      .expect(204);
  });

  it("should upload file with stream", done => {
    service.getSignedUrl("stream.txt", { action: "upload" }).then(url => {
      const filename = tmpNameSync({ postfix: ".txt" });
      writeFileSync(filename, "hogehoge", "utf8");
      const req = request(app.getHttpServer())
        .put(url)
        .expect(204);
      const stream = createReadStream(filename);
      stream.on("end", () => req.end(done));
      stream.pipe<any>(req, { end: false });
    });
  });

  it("should throw error if body parser enabled and upload json", async () => {
    await app.close();
    const module = await Test.createTestingModule({
      imports: [StorageModule.register({ bucket: "bucket" })],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    service = await app.resolve<StorageService>(StorageService);

    const url = await service.getSignedUrl("test.json", { action: "upload" });
    await request(app.getHttpServer())
      .put(url)
      .set("Content-Type", "application/json")
      .send({ test: "json" })
      .expect(400, {
        error:
          "Could not upload json file. Is body-parser enabled? It should be disable: 'NestFactory.create(AppModule, { bodyParser: false })'",
        message: "Bad Request",
        statusCode: 400,
      });
  });
  it("should upload json file", async () => {
    const url = await service.getSignedUrl("test.json", { action: "upload" });
    await request(app.getHttpServer())
      .put(url)
      .set("Content-Type", "application/json")
      .send({ test: "json" })
      .expect(204);
  });
});
