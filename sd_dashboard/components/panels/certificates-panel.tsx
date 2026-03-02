"use client"

import { ColumnCard } from "@/components/column-card"
import type { Certificate } from "@/lib/api/certificate"
import { useCertificates } from "@/lib/hooks/use-certificates"
import Image from "next/image"

const TITLE = "Certificates"

export function CertificatesPanel({ initialData = [] }: { initialData?: Certificate[] }) {
  const { data: certificates } = useCertificates({ initialData })

  return (
    <div className="h-full p-2">
      <ColumnCard title={TITLE} scrollable>
        <div className="p-4 min-h-0">
          {certificates && certificates.length > 0 ? (
            certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="mb-4 last:mb-0 flex justify-center"
              >
                <Image
                  src={certificate.path}
                  alt="Certificate"
                  width={250}
                  height={180}
                  className="object-contain rounded-lg border-2 shadow-md"
                />
              </div>
            ))
          ) : (
            <div className="text-base text-muted-foreground text-center py-6">
              No certificates available.
            </div>
          )}
        </div>
      </ColumnCard>
    </div>
  )
}
