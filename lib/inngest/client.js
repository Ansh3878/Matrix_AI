import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "matrix", // Unique app ID
  name: "Matrix",
  credentials: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
    },
  },
});