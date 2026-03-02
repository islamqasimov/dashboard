"use client"

import { ColumnCard } from "@/components/column-card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { Video } from "@/lib/api/video"
import { useVideos } from "@/lib/hooks/use-videos"
import { useCallback, useState } from "react"

const TITLE = "Videos"

export function VideosPanel({ initialData = [] }: { initialData?: Video[] }) {
  const { data: videos } = useVideos({ initialData })
  const [index, setIndex] = useState(0)

  const goPrev = useCallback(() => {
    setIndex((i) => (i <= 0 ? videos.length - 1 : i - 1))
  }, [videos.length])

  const goNext = useCallback(() => {
    setIndex((i) => (i >= videos.length - 1 ? 0 : i + 1))
  }, [videos.length])

  if (videos.length === 0) {
    return (
      <div className="h-full p-2">
        <ColumnCard title={TITLE} scrollable={false}>
          <div className="flex h-full min-h-0 items-center justify-center p-4">
            <p className="text-sm text-muted-foreground">No videos available.</p>
          </div>
        </ColumnCard>
      </div>
    )
  }

  const video = videos[index] as Video

  return (
    <div className="h-full p-2">
      <ColumnCard title={TITLE} scrollable={false}>
        <div className="flex h-full min-h-0 flex-col justify-center items-center p-3">
          <div className="flex flex-1 w-full items-center justify-center">
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: ignore */}
            <video
              key={video.id}
              src={video.path}
              className="max-h-[360px] w-auto max-w-full object-contain rounded-lg mx-auto"
              playsInline
              aria-label={`Video ${index + 1}`}
              onClick={(e) => {
                const vid = e.currentTarget as HTMLVideoElement;
                if (vid.paused) {
                  vid.play();
                } else {
                  vid.pause();
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <track kind="captions" />
            </video>
          </div>
          <Pagination className="mt-3 w-full">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    goPrev()
                  }}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="flex h-9 items-center justify-center px-4 text-sm text-muted-foreground">
                  {index + 1} of {videos.length}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    goNext()
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </ColumnCard>
    </div>
  )
}
