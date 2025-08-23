import { type FileJob, type InsertFileJob, type CryptoRate, type InsertCryptoRate, type Comment, type InsertComment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // File job operations
  createFileJob(job: InsertFileJob): Promise<FileJob>;
  getFileJob(id: string): Promise<FileJob | undefined>;
  updateFileJob(id: string, updates: Partial<FileJob>): Promise<FileJob | undefined>;
  
  // Crypto rate operations
  getCryptoRate(fromCurrency: string, toCurrency: string): Promise<CryptoRate | undefined>;
  upsertCryptoRate(rate: InsertCryptoRate): Promise<CryptoRate>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getComments(toolId?: string): Promise<Comment[]>;
  getComment(id: string): Promise<Comment | undefined>;
}

export class MemStorage implements IStorage {
  private fileJobs: Map<string, FileJob>;
  private cryptoRates: Map<string, CryptoRate>;
  private comments: Map<string, Comment>;

  constructor() {
    this.fileJobs = new Map();
    this.cryptoRates = new Map();
    this.comments = new Map();
  }

  async createFileJob(insertJob: InsertFileJob): Promise<FileJob> {
    const id = randomUUID();
    const job: FileJob = {
      ...insertJob,
      id,
      status: "pending",
      originalSize: insertJob.originalSize || 0,
      resultData: null,
      errorMessage: null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.fileJobs.set(id, job);
    return job;
  }

  async getFileJob(id: string): Promise<FileJob | undefined> {
    return this.fileJobs.get(id);
  }

  async updateFileJob(id: string, updates: Partial<FileJob>): Promise<FileJob | undefined> {
    const job = this.fileJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    if (updates.status === "completed" || updates.status === "failed") {
      updatedJob.completedAt = new Date();
    }
    
    this.fileJobs.set(id, updatedJob);
    return updatedJob;
  }

  private getCryptoRateKey(fromCurrency: string, toCurrency: string): string {
    return `${fromCurrency}-${toCurrency}`;
  }

  async getCryptoRate(fromCurrency: string, toCurrency: string): Promise<CryptoRate | undefined> {
    return this.cryptoRates.get(this.getCryptoRateKey(fromCurrency, toCurrency));
  }

  async upsertCryptoRate(insertRate: InsertCryptoRate): Promise<CryptoRate> {
    const key = this.getCryptoRateKey(insertRate.fromCurrency, insertRate.toCurrency);
    const existingRate = this.cryptoRates.get(key);
    
    const rate: CryptoRate = {
      id: existingRate?.id || randomUUID(),
      ...insertRate,
      marketData: insertRate.marketData || {},
      lastUpdated: new Date(),
    };
    
    this.cryptoRates.set(key, rate);
    return rate;
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      ...insertComment,
      id,
      authorEmail: insertComment.authorEmail || null,
      toolId: insertComment.toolId || null,
      rating: insertComment.rating || 5,
      isPublished: "true",
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  async getComments(toolId?: string): Promise<Comment[]> {
    const allComments = Array.from(this.comments.values());
    const publishedComments = allComments.filter(comment => comment.isPublished === "true");
    
    if (toolId) {
      return publishedComments.filter(comment => comment.toolId === toolId);
    }
    
    return publishedComments.sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getComment(id: string): Promise<Comment | undefined> {
    return this.comments.get(id);
  }
}

export const storage = new MemStorage();
