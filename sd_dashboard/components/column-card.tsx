"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useRef } from "react"

export function ColumnCard({
  title,
  children,
  scrollable = true,
  onHeaderClick,
}: {
  title: string
  children: React.ReactNode
  scrollable?: boolean
  onHeaderClick?: (rect: DOMRect) => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleHeaderClick = () => {
    if (onHeaderClick && cardRef.current) {
      onHeaderClick(cardRef.current.getBoundingClientRect())
    }
  }

  return (
    <div ref={cardRef} className="flex h-full min-h-0 flex-col">
      <Card className="flex flex-col h-full min-h-0">
        <CardHeader
          className="shrink-0 cursor-pointer select-none hover:bg-muted/50 transition-colors rounded-t-xl"
          onClick={handleHeaderClick}
        >
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <Separator className="shrink-0" />
        <CardContent className="flex-1 min-h-0 p-0">
          {scrollable ? (
            <ScrollArea className="h-full min-h-0">
              {children}
            </ScrollArea>
          ) : (
            children
          )}
        </CardContent>
      </Card>
    </div>
  )
}
