import { Router } from "express";

import workspaceRoutes from "./modules/workspace/workspace.routes.js";
import parserRoutes from "./modules/parser/parser.routes.js";
import chunkRoutes from "./modules/chunk/chunk.routes.js";
import graphRoutes from "./modules/graph/graph.routes.js";
import indexerRoutes from "./modules/indexer/indexer.routes.js";
import fileRoutes from "./modules/file/file.routes.js";
import resolverRoutes from "./modules/resolver/resolver.route.js";
import architectureRoutes from "./modules/architecture/architecture.routes.js";
import explainerRoutes from "./modules/explainer/explainer.routes.js";
import decisionRoutes from "./modules/decision/decision.routes.js";
import contextRoutes from "./modules/context/context.routes.js";
import intentRoutes from "./modules/intent/intent.routes.js";
import intelligenceRoutes from "./modules/intelligence/intelligence.routes.js";
import plannerRoutes from "./modules/planner/planner.routes.js";
import refactorRoutes from "./modules/refactor/refactor.routes.js";
import transformationRoutes from "./modules/transformation/transformation.routes.js";
import callgraphRoutes from "./modules/callgraph/callgraph.routes.js";
import refactorPlanRoutes from "./modules/refactor-plan/refactor-plan.routes.js";
import changesetRoutes from "./modules/changeset/changeset.routes.js";
import astRefactorRoutes from "./modules/ast-refactor/ast-refactor.routes.js";
import changeSetExecutorRoutes from "./modules/changeset-executor/changeset-executor.routes.js";
import diffPreviewRoutes from "./modules/diff-preview/diff-preview.routes.js";
import snapshotRoutes from "./modules/snapshot/snapshot.routes.js";
import embeddingRoutes from "./modules/embedding/embedding.routes.js";
import aiRoutes from "./modules/ai/ai.routes.js";
import repositoryRoutes from "./modules/repository/repository.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import { verifyToken } from "./middlewares/auth.middleware.js";
import flowExplainRoutes from "./modules/flow-explainer/flow-explainer.routes.js";
import validationRoutes from "./modules/validation/validation.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workspaces", verifyToken, workspaceRoutes);
router.use("/parser", parserRoutes);
router.use("/chunks", chunkRoutes);
router.use("/graph", graphRoutes);
router.use("/file", fileRoutes);
router.use("/indexer", indexerRoutes);
router.use("/resolver", verifyToken, resolverRoutes);
router.use("/architecture", verifyToken, architectureRoutes);
router.use("/explainer", verifyToken, explainerRoutes);
router.use("/decision", verifyToken, decisionRoutes);
router.use("/context", verifyToken, contextRoutes);
router.use("/intent", verifyToken, intentRoutes);
router.use("/intelligence", verifyToken, intelligenceRoutes);
router.use("/planner", verifyToken, plannerRoutes);
router.use("/refactor", verifyToken, refactorRoutes);
router.use("/transformation", verifyToken, transformationRoutes);
router.use("/callgraph", verifyToken, callgraphRoutes);
router.use("/refactor-plan", verifyToken, refactorPlanRoutes);
router.use("/changeset", changesetRoutes);
router.use("/ast-refactor", astRefactorRoutes);
router.use("/changeset-executor", changeSetExecutorRoutes);
router.use("/diff-preview", diffPreviewRoutes);
router.use("/snapshot", snapshotRoutes);
router.use("/embedding", embeddingRoutes);
router.use("/ai", aiRoutes);
router.use("/repository", repositoryRoutes);
router.use("/flow-explain", flowExplainRoutes);
router.use("/validation", validationRoutes);

export default router;

// 6a1f4d5367280e07749d431a
