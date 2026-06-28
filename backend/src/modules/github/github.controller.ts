import { Request, Response } from "express";
import { GithubService } from "../../shared/github/github.service.js";

const githubService = new GithubService();

export class GithubController {
  async listRepos(req: Request, res: Response) {
    try {
      const token = (req.query.token as string) || undefined;
      const repos = await githubService.listUserRepos(token);
      return res.status(200).json({ success: true, data: repos });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to list GitHub repos",
      });
    }
  }
}
