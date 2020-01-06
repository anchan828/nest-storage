import { FILE_NOT_FOUND } from "./messages";

describe("FILE_NOT_FOUND", () => {
  it("should return message", () => {
    expect(FILE_NOT_FOUND("bucket", "filename")).toBe(
      `File not found: ${JSON.stringify({ bucket: "bucket", filename: "filename" })}`,
    );
  });
});
