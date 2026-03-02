import { useSuspenseQuery } from "@tanstack/react-query"
import { fetchNewsHtml } from "@/lib/api/news"

export function useNewsHtml({initialData}: {initialData?: string}) {
  return useSuspenseQuery<string>({
    queryKey: ["news-html"],
    queryFn: fetchNewsHtml,
    initialData,
  })
}
