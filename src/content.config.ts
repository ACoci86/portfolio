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
    // What the project was built with, picked from a fixed list in .pages.yml
    // so the names stay spelled the same everywhere. Empty means no chips show.
    tech: z.array(z.string()).default([]),
  }),
});

export const collections = { projects };
