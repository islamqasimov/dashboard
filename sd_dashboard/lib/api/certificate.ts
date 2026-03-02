"use server"

import { readdir } from "node:fs/promises"
import { join } from "node:path"

export type Certificate = {
  id: string
  path: string
}

export async function fetchCertificates(): Promise<Certificate[]> {
  try {
    const dir = join(process.cwd(), "public", "certificates")
    const entries = await readdir(dir, { withFileTypes: true })
    return entries
      .filter((e) => e.isFile())
      .map((e) => ({ id: crypto.randomUUID(), path: `/certificates/${e.name}` })) as Certificate[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return []
    }
    throw new Error("Failed to read certificates")
  }
}
