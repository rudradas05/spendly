"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getErrorMessage } from "@/lib/serialize";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.4,
    maxOutputTokens: 2048,
    responseMimeType: "application/json",
  },
});

type ScanReceiptInput = {
  base64Image: string;
  mimeType: string;
};

type ScannedReceiptData = {
  amount: number;
  date: string;
  description: string;
  category: string;
  confidence: number;
};

type ScanReceiptResult =
  | { success: true; data: ScannedReceiptData }
  | { success: false; error: string };

const VALID_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];

const VALID_CATEGORIES = [
  "housing",
  "transportation",
  "groceries",
  "utilities",
  "entertainment",
  "food",
  "shopping",
  "healthcare",
  "education",
  "personal",
  "travel",
  "insurance",
  "gifts",
  "bills",
  "other-expense",
];

export async function scanReceipt({
  base64Image,
  mimeType,
}: ScanReceiptInput): Promise<ScanReceiptResult> {
  try {
    // Validate mime type
    if (!VALID_MIME_TYPES.includes(mimeType)) {
      throw new Error(
        `Invalid image type. Supported: ${VALID_MIME_TYPES.join(", ")}`,
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const prompt = `You are a receipt parser. Extract transaction data from this receipt image. Return a JSON object with this exact shape: { "amount": number, "date": "ISO date string or empty string if unclear", "description": "merchant name or item description", "category": "must be exactly one of: housing, transportation, groceries, utilities, entertainment, food, shopping, healthcare, education, personal, travel, insurance, gifts, bills, other-expense", "confidence": number between 0 and 1 }. If you cannot read a field with confidence, use 0 for amount, empty string for text fields.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      },
      prompt,
    ]);

    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error("No response from Gemini API");
    }

    // Parse JSON (responseMimeType ensures clean JSON output)
    const parsed = JSON.parse(text);

    // Validate the result
    const amount =
      typeof parsed.amount === "number" && parsed.amount > 0
        ? parsed.amount
        : 0;
    const confidence =
      typeof parsed.confidence === "number" &&
      parsed.confidence >= 0 &&
      parsed.confidence <= 1
        ? parsed.confidence
        : 0;
    const category = VALID_CATEGORIES.includes(parsed.category)
      ? parsed.category
      : "other-expense";

    return {
      success: true,
      data: {
        amount,
        date: parsed.date || "",
        description: parsed.description || "",
        category,
        confidence,
      },
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
