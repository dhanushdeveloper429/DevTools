import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { storage } from "./storage";
import { insertFileJobSchema, insertCommentSchema } from "@shared/schema";
import mammoth from "mammoth";
import { z } from "zod";

// Extend Request type to include file property from multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Crypto conversion endpoint
  app.get("/api/crypto/convert", async (req, res) => {
    try {
      const { from, to, amount } = req.query;
      
      if (!from || !to || !amount) {
        return res.status(400).json({ message: "Missing required parameters: from, to, amount" });
      }

      // Check cache first
      const cachedRate = await storage.getCryptoRate(from as string, to as string);
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      let rate: number;
      let marketData: any = null;

      if (cachedRate && cachedRate.lastUpdated && cachedRate.lastUpdated > fiveMinutesAgo) {
        rate = parseFloat(cachedRate.rate);
        marketData = cachedRate.marketData;
      } else {
        // Fetch from CoinGecko API
        const coinGeckoApiKey = process.env.COINGECKO_API_KEY || process.env.CRYPTO_API_KEY || "";
        const headers: HeadersInit = {};
        if (coinGeckoApiKey) {
          headers['X-CG-Demo-API-Key'] = coinGeckoApiKey;
        }

        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${from}&vs_currencies=${to}&include_market_cap=true&include_24hr_change=true&include_24hr_vol=true`,
          { headers }
        );

        if (!response.ok) {
          throw new Error(`CoinGecko API error: ${response.statusText}`);
        }

        const data = await response.json();
        const fromLower = (from as string).toLowerCase();
        const toLower = (to as string).toLowerCase();

        if (!data[fromLower] || !data[fromLower][toLower]) {
          return res.status(404).json({ message: "Currency pair not found" });
        }

        rate = data[fromLower][toLower];
        marketData = {
          marketCap: data[fromLower][`${toLower}_market_cap`],
          change24h: data[fromLower][`${toLower}_24h_change`],
          volume24h: data[fromLower][`${toLower}_24h_vol`],
        };

        // Cache the rate
        await storage.upsertCryptoRate({
          fromCurrency: from as string,
          toCurrency: to as string,
          rate: rate.toString(),
          marketData,
        });
      }

      const convertedAmount = parseFloat(amount as string) * rate;

      res.json({
        from,
        to,
        amount: parseFloat(amount as string),
        rate,
        convertedAmount,
        marketData,
        lastUpdated: cachedRate?.lastUpdated || now,
      });

    } catch (error) {
      console.error("Crypto conversion error:", error);
      res.status(500).json({ message: "Failed to convert crypto currency" });
    }
  });

  // PDF to text conversion
  app.post("/api/convert/pdf-to-text", upload.single("file"), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const job = await storage.createFileJob({
        filename: req.file.originalname,
        fileType: "pdf",
        conversionType: "to_text",
        originalSize: req.file.size,
      });

      // Process the PDF using dynamic import to avoid initialization issues
      const fileBuffer = await fs.readFile(req.file.path);
      const pdfParse = (await import("pdf-parse")).default;
      const pdfData = await pdfParse(fileBuffer);

      await storage.updateFileJob(job.id, {
        status: "completed",
        resultData: {
          text: pdfData.text,
          pages: pdfData.numpages,
          info: pdfData.info,
        },
      });

      // Clean up uploaded file
      await fs.unlink(req.file.path);

      res.json({
        jobId: job.id,
        text: pdfData.text,
        pages: pdfData.numpages,
        info: pdfData.info,
      });

    } catch (error) {
      console.error("PDF conversion error:", error);
      res.status(500).json({ message: "Failed to convert PDF to text" });
    }
  });

  // DOCX to text conversion
  app.post("/api/convert/docx-to-text", upload.single("file"), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const job = await storage.createFileJob({
        filename: req.file.originalname,
        fileType: "docx",
        conversionType: "to_text",
        originalSize: req.file.size,
      });

      // Process the DOCX
      const fileBuffer = await fs.readFile(req.file.path);
      const result = await mammoth.extractRawText({ buffer: fileBuffer });

      await storage.updateFileJob(job.id, {
        status: "completed",
        resultData: {
          text: result.value,
          messages: result.messages,
        },
      });

      // Clean up uploaded file
      await fs.unlink(req.file.path);

      res.json({
        jobId: job.id,
        text: result.value,
        messages: result.messages,
      });

    } catch (error) {
      console.error("DOCX conversion error:", error);
      res.status(500).json({ message: "Failed to convert DOCX to text" });
    }
  });

  // Get file conversion job status
  app.get("/api/jobs/:jobId", async (req, res) => {
    try {
      const job = await storage.getFileJob(req.params.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Job status error:", error);
      res.status(500).json({ message: "Failed to get job status" });
    }
  });

  // JSON validation endpoint
  app.post("/api/validate/json", async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "No content provided" });
      }

      // Parse JSON to validate
      const parsed = JSON.parse(content);
      
      // Calculate statistics
      const stats = {
        size: Buffer.byteLength(content, 'utf8'),
        lines: content.split('\n').length,
        objects: countObjects(parsed),
        arrays: countArrays(parsed),
      };

      res.json({
        valid: true,
        formatted: JSON.stringify(parsed, null, 2),
        minified: JSON.stringify(parsed),
        stats,
      });

    } catch (error) {
      res.status(400).json({
        valid: false,
        error: error instanceof Error ? error.message : "Invalid JSON",
      });
    }
  });

  // XML validation and formatting endpoint
  app.post("/api/validate/xml", async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "No content provided" });
      }

      // Basic XML validation (would use a proper XML parser in production)
      if (!content.trim().startsWith('<') || !content.trim().endsWith('>')) {
        throw new Error("Invalid XML structure");
      }

      // Simple XML formatting (in production, use a proper XML formatter)
      const formatted = formatXML(content);

      res.json({
        valid: true,
        formatted,
        minified: content.replace(/>\s+</g, '><').trim(),
      });

    } catch (error) {
      res.status(400).json({
        valid: false,
        error: error instanceof Error ? error.message : "Invalid XML",
      });
    }
  });

  // Comments endpoints
  app.post("/api/comments", async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Create comment error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.get("/api/comments", async (req, res) => {
    try {
      const { toolId } = req.query;
      const comments = await storage.getComments(toolId as string);
      res.json(comments);
    } catch (error) {
      console.error("Get comments error:", error);
      res.status(500).json({ message: "Failed to retrieve comments" });
    }
  });

  app.get("/api/comments/:id", async (req, res) => {
    try {
      const comment = await storage.getComment(req.params.id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      res.json(comment);
    } catch (error) {
      console.error("Get comment error:", error);
      res.status(500).json({ message: "Failed to retrieve comment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions
function countObjects(obj: any): number {
  if (typeof obj !== 'object' || obj === null) return 0;
  if (Array.isArray(obj)) {
    return obj.reduce((count: number, item: any) => count + countObjects(item), 0);
  }
  return 1 + Object.values(obj).reduce((count: number, value: any) => count + countObjects(value), 0);
}

function countArrays(obj: any): number {
  if (typeof obj !== 'object' || obj === null) return 0;
  if (Array.isArray(obj)) {
    return 1 + obj.reduce((count: number, item: any) => count + countArrays(item), 0);
  }
  return Object.values(obj).reduce((count: number, value: any) => count + countArrays(value), 0);
}

function formatXML(xml: string): string {
  let formatted = '';
  let indent = 0;
  const tab = '  ';
  
  xml.split(/>\s*</).forEach((node, index) => {
    if (index > 0) formatted += '>';
    if (index < xml.split(/>\s*</).length - 1) formatted += '<';
    
    if (node.match(/^\/\w/)) indent--;
    formatted += '\n' + tab.repeat(indent) + node;
    if (node.match(/^<?\w[^>]*[^\/]$/)) indent++;
  });
  
  return formatted.substring(1);
}
