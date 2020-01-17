import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
@Injectable()
export class StorageDeleteMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    console.log("Request StorageDeleteMiddleware...");
    next();
  }
}
