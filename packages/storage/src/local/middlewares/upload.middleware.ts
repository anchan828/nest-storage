import { SignedUrlActionType, StorageModuleOptions, STORAGE_MODULE_OPTIONS } from "@anchan828/nest-storage-common";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { Request, Response } from "express";
import { createWriteStream, statSync } from "fs";
import { extname } from "path";
import { tmpNameSync } from "tmp";
import { StorageService } from "../../storage.service";
import { StorageBaseMiddleware } from "./base.middleware";
@Injectable()
export class StorageUploadMiddleware extends StorageBaseMiddleware {
  constructor(
    @Inject(STORAGE_MODULE_OPTIONS)
    readonly moduleOptions: StorageModuleOptions,
    private readonly service: StorageService,
  ) {
    super(moduleOptions);
  }

  getAction(): SignedUrlActionType {
    return "upload";
  }

  async handler(bucket: string, filename: string, req: Request, res: Response): Promise<void> {
    const dataPath = await this.getDataPath(req, filename);
    await this.service
      .upload(dataPath, filename, { bucket })
      .then(() => res.status(204).end())
      .catch(e => {
        throw new BadRequestException(e.message);
      });
  }

  private async getDataPath(req: Request, filename: string): Promise<string> {
    let dataPath = "";
    if (Array.isArray(req.files) && req.files.length !== 0) {
      dataPath = req.files[0].path;
    } else {
      const file = await this.writeFileStream(req, filename);
      if (statSync(file).size !== 0) {
        dataPath = file;
      }
    }

    if (!dataPath) {
      // file not uploaded
      throw new BadRequestException("The file was not uploaded");
    }

    return dataPath;
  }

  private async writeFileStream(req: Request, filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const path = tmpNameSync({ postfix: extname(filename) });
      const stream = createWriteStream(path);
      req.pipe(stream);
      stream.on("close", () => resolve(path));
      stream.on("error", (err: Error) => reject(err));
    });
  }
}
