import { Router } from "express";
import { ParserService } from "./parser.service.js";

const router = Router();

const parserService = new ParserService();

router.post("/test", (req, res) => {
  const result = parserService.parseCode(req.body.code);

  return res.json(result);
});

export default router;
