import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const projects = defineCollection({
  // Load every Markdown file inside src/content/projects as a project entry.
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    repo: z.string().url().optional(),
    image: z.string().optional(), // e.g. "/images/daisy.jpg" (lives in public/)
  }),
});

export const collections = { projects };
