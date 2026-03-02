"use client"

import { QueryClient, QueryClientProvider, } from "@tanstack/react-query"
import { type ReactNode, useState } from "react"

type ProvidersProps = {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Use a single QueryClient instance per provider.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1 minute
            refetchOnWindowFocus: true,
            retry: 1,
            gcTime: 1000 * 60 * 5, // 5 minutes
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
