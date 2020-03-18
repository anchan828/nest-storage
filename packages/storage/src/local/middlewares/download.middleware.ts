import { SignedUrlActionType, StorageModuleOptions, STORAGE_MODULE_OPTIONS } from "@anchan828/nest-storage-common";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { Request, Response } from "express";
import { basename } from "path";
import { StorageService } from "../../storage.service";
import { StorageBaseMiddleware } from "./base.middleware";

@Injectable()
export class StorageDownloadMiddleware extends StorageBaseMiddleware {
  constructor(
    @Inject(STORAGE_MODULE_OPTIONS)
    readonly moduleOptions: StorageModuleOptions,
    private readonly service: StorageService,
  ) {
    super(moduleOptions);
  }

  getAction(): SignedUrlActionType {
    return "download";
  }

  async handler(bucket: string, filename: string, req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, rejects) => {
      try {
        const path = await this.service.download(filename, { bucket });
        res.download(path, basename(filename), (err?: Error) => {
          if (err) {
            rejects(new BadRequestException(err.message));
          }

          resolve();
        });
      } catch (e) {
        rejects(new BadRequestException(e.message));
      }
    });
  }
}
