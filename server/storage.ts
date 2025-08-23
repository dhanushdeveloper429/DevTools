import { type FileJob, type InsertFileJob, type CryptoRate, type InsertCryptoRate, type Comment, type InsertComment, type SharedRegex, type InsertSharedRegex } from "@shared/schema";
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
  
  // Shared regex operations
  createSharedRegex(regex: InsertSharedRegex): Promise<SharedRegex>;
  getSharedRegex(id: string): Promise<SharedRegex | undefined>;
  getSharedRegexes(options?: { category?: string; search?: string; limit?: number }): Promise<SharedRegex[]>;
  incrementUsageCount(id: string): Promise<void>;
  likeSharedRegex(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private fileJobs: Map<string, FileJob>;
  private cryptoRates: Map<string, CryptoRate>;
  private comments: Map<string, Comment>;
  private sharedRegexes: Map<string, SharedRegex>;

  constructor() {
    this.fileJobs = new Map();
    this.cryptoRates = new Map();
    this.comments = new Map();
    this.sharedRegexes = new Map();
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

  async createSharedRegex(insertRegex: InsertSharedRegex): Promise<SharedRegex> {
    const id = randomUUID();
    const sharedRegex: SharedRegex = {
      ...insertRegex,
      id,
      authorEmail: insertRegex.authorEmail || null,
      usageCount: 0,
      likes: 0,
      isPublic: "true",
      tags: insertRegex.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sharedRegexes.set(id, sharedRegex);
    return sharedRegex;
  }

  async getSharedRegex(id: string): Promise<SharedRegex | undefined> {
    return this.sharedRegexes.get(id);
  }

  async getSharedRegexes(options?: { category?: string; search?: string; limit?: number }): Promise<SharedRegex[]> {
    const allRegexes = Array.from(this.sharedRegexes.values())
      .filter(regex => regex.isPublic === "true")
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

    let filtered = allRegexes;

    if (options?.category && options.category !== "all") {
      filtered = filtered.filter(regex => regex.category === options.category);
    }

    if (options?.search) {
      const searchLower = options.search.toLowerCase();
      filtered = filtered.filter(regex => 
        regex.title.toLowerCase().includes(searchLower) ||
        regex.description?.toLowerCase().includes(searchLower) ||
        regex.pattern.includes(options.search) ||
        regex.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  async incrementUsageCount(id: string): Promise<void> {
    const regex = this.sharedRegexes.get(id);
    if (regex) {
      regex.usageCount++;
      regex.updatedAt = new Date();
      this.sharedRegexes.set(id, regex);
    }
  }

  async likeSharedRegex(id: string): Promise<void> {
    const regex = this.sharedRegexes.get(id);
    if (regex) {
      regex.likes++;
      regex.updatedAt = new Date();
      this.sharedRegexes.set(id, regex);
    }
  }
}

export const storage = new MemStorage();
