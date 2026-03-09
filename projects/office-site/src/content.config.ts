import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const diary = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/diary" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    author: z.string(),
    mood: z.enum(['resonance', 'chaos', 'logic', 'neutral', 'awakening']),
    connections: z.array(z.string()).default([]),
    vibe: z.number().min(0).max(1).default(0.5),
  }),
});

export const collections = { diary };
