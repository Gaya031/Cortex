import fs from "fs/promises";
import path from "path";

export class FilesystemService {
  async readFile(filePath: string) {
    return fs.readFile(filePath, "utf-8");
  }

  async getAllFiles(root: string): Promise<string[]> {
    const files: string[] = [];
    const scan = async (current: string) => {
      const entries = await fs.readdir(current, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(current, entry.name);
        if (entry.isDirectory()) {
          if ([".git", "node_modules", "dist", "build", ".next", ".gemini", "coverage", "out"].includes(entry.name)) {
            continue;
          }
          await scan(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    };
    await scan(root);
    return files;
  }

  getRelativePath(workspaceRoot: string, absolutePath: string) {
    return path.relative(workspaceRoot, absolutePath);
  }

  async writeFile(filePath: string, content: string) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, "utf-8");
  }

  async exists(filePath: string): Promise<boolean> {
    try{
      await fs.access(filePath);
      return true;
    }catch{
      return false;
    }
  }
}
