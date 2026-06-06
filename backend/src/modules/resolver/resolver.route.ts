import { Router } from "express";
import { ResolverService } from "./resolver.service.js";
import { ResolverController } from "./resolver.controller.js";

const router = Router();

const resolverService = new ResolverService();
const resolverController = new ResolverController();

router.post("/test", (req, res) => {
  const { currentFilePath, importPath } = req.body;

  const result = resolverService.resolveImport(currentFilePath, importPath);
  return res.json({ success: true, resolvedPath: result });
});
router.post("/resolve-route", async (req, res) => {
  const { workspaceId, currentFilePath, importPath } = req.body;

  const result = await resolverService.resolveFile(
    workspaceId,
    currentFilePath,
    importPath,
  );

  return res.json({ success: true, result });
});

router.post(
  "/resolve-file",
  resolverController.resolveFile,
);

export default router;
