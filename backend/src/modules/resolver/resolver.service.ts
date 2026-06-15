import path from "path";
import { FileRepository } from "../file/file.repository.js";

export class ResolverService {
  private readonly fileRepository = new FileRepository();

  resolveImport(currentFilePath: string, importPath: string) {
    if (!importPath.startsWith(".")) return null;
    const currentDir = path.dirname(currentFilePath);
    const resolvedPath = path.normalize(path.join(currentDir, importPath));
    return resolvedPath.replace(/\\/g, "/");
  }

  async resolveAndVerify(
    workspaceId: string,
    currentFilePath: string,
    importPath: string,
  ) {
    const resolved = this.resolveImport(currentFilePath, importPath);
    if (!resolved) return null;
    return resolved;
  }

  async resolveFile(
    workspaceId: string,
    currentFilePath: string,
    importPath: string,
  ) {
    const basePath = this.resolveImport(currentFilePath, importPath);

    if(!basePath) return null;

    const candidates = [
        `${basePath}.ts`,
        `${basePath}.tsx`,
        `${basePath}.js`,
        `${basePath}.jsx`,
        `${basePath}/index.ts`,
        `${basePath}/index.tsx`,
    ];

    for(const candidate of candidates){
        const file = await this.fileRepository.findByPath(workspaceId, candidate);
        if(file) return candidate;
        return null;
    }
  }
}
