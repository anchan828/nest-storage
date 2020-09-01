import {
  LocalStorageProviderModuleOptions,
  SignedUrlActionType,
  STORAGE_PROVIDER,
  STORAGE_PROVIDER_MODULE_OPTIONS,
} from "@anchan828/nest-storage-common";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { Request, Response } from "express";
import { basename } from "path";
import { LocalStorage } from "../local.storage";
import { StorageBaseMiddleware } from "./base.middleware";

@Injectable()
export class StorageDownloadMiddleware extends StorageBaseMiddleware {
  constructor(
    @Inject(STORAGE_PROVIDER_MODULE_OPTIONS) readonly moduleOptions: LocalStorageProviderModuleOptions,
    @Inject(STORAGE_PROVIDER) private readonly storage: LocalStorage,
  ) {
    super(moduleOptions);
  }

  getAction(): SignedUrlActionType {
    return "download";
  }

  async handler(bucket: string, filename: string, req: Request, res: Response): Promise<void> {
    return new Promise<void>(async (resolve, rejects) => {
      try {
        const path = await this.storage.download(filename, { bucket });
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
