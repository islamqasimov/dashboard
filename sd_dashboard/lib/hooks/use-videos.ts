import { useSuspenseQuery } from "@tanstack/react-query"
import type { Video } from "@/lib/api/video"
import { fetchVideos } from "@/lib/api/video"

export function useVideos({initialData}: {initialData?: Video[]}) {
  return useSuspenseQuery<Video[]>({
    queryKey: ["videos"],
    queryFn: fetchVideos,
    initialData,
  })
}
