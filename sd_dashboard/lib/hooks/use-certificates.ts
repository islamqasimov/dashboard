import { useSuspenseQuery } from "@tanstack/react-query"
import type { Certificate } from "@/lib/api/certificate"
import { fetchCertificates } from "@/lib/api/certificate"

export function useCertificates({initialData}: {initialData?: Certificate[]}) {
  return useSuspenseQuery<Certificate[]>({
    queryKey: ["certificates"],
    queryFn: fetchCertificates,
    initialData,
  })
}
