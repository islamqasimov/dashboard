"use client"

import { ColumnCard } from "@/components/column-card"
import { useNewsHtml } from "@/lib/hooks/use-news"

const TITLE = "News"

export function NewsPanel({ initialData = "" }: { initialData?: string } = {}) {
  const { data: html } = useNewsHtml({ initialData })

  return (
    <div className="h-full p-2">
      <ColumnCard title={TITLE} scrollable={false}>
        <div className="flex flex-col h-full p-4 min-h-0">
          <iframe
            title="News"
            srcDoc={html}
            className="flex-1 w-full rounded-lg border"
            style={{ minHeight: 0, minWidth: 0 }}
          />
        </div>
      </ColumnCard>
    </div>
  )
}
