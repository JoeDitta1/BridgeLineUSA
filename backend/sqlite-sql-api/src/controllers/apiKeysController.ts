import { Request, Response } from 'express';
import { ApiKeyService } from '../services/apiKeyService';

export class ApiKeysController {
  private apiKeyService: ApiKeyService;

  constructor() {
    this.apiKeyService = new ApiKeyService();
  }

  public async createApiKey(req: Request, res: Response): Promise<void> {
    try {
      const apiKey = await this.apiKeyService.createApiKey(req.body);
      res.status(201).json(apiKey);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  public async getApiKeys(req: Request, res: Response): Promise<void> {
    try {
      const apiKeys = await this.apiKeyService.getApiKeys();
      res.status(200).json(apiKeys);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  public async updateApiKey(req: Request, res: Response): Promise<void> {
    try {
      const updatedApiKey = await this.apiKeyService.updateApiKey(req.params.id, req.body);
      res.status(200).json(updatedApiKey);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  public async deleteApiKey(req: Request, res: Response): Promise<void> {
    try {
      await this.apiKeyService.deleteApiKey(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}