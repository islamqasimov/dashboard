"use server"

import { readdir } from "node:fs/promises"
import { join } from "node:path"

export type Video = {
  id: string
  path: string
}

export async function fetchVideos(): Promise<Video[]> {
  try {
    const dir = join(process.cwd(), "public", "videos")
    const entries = await readdir(dir, { withFileTypes: true })
    return entries
      .filter((e) => e.isFile())
      .map((e) => ({ id: crypto.randomUUID(), path: `/videos/${e.name}` })) as Video[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return []
    }
    throw new Error("Failed to read videos")
  }
}
