import { type FileJob, type InsertFileJob, type CryptoRate, type InsertCryptoRate } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // File job operations
  createFileJob(job: InsertFileJob): Promise<FileJob>;
  getFileJob(id: string): Promise<FileJob | undefined>;
  updateFileJob(id: string, updates: Partial<FileJob>): Promise<FileJob | undefined>;
  
  // Crypto rate operations
  getCryptoRate(fromCurrency: string, toCurrency: string): Promise<CryptoRate | undefined>;
  upsertCryptoRate(rate: InsertCryptoRate): Promise<CryptoRate>;
}

export class MemStorage implements IStorage {
  private fileJobs: Map<string, FileJob>;
  private cryptoRates: Map<string, CryptoRate>;

  constructor() {
    this.fileJobs = new Map();
    this.cryptoRates = new Map();
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
}

export const storage = new MemStorage();
