import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    name: z.string(),
    title: z.string(),
    description: z.string(),
    stack: z.array(z.string()),
    href: z.string().optional(),
    gif: z.string().optional(),
    liveHref: z.string().optional(),
  }),
});

export const collections = { projects };
