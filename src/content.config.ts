import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { wordSchema } from "./lib/schema";

const words = defineCollection({
  loader: file("src/data/words.json"),
  schema: wordSchema,
});

export const collections = { words };
