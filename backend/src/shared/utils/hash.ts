import crypto from "crypto";

export const generateHash = (content: string) => {
  return crypto.createHash("sha256").update(content).digest("hex");
};
