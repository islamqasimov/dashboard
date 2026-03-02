import { CertificatesPanel } from "@/components/panels/certificates-panel"
import { NewsPanel } from "@/components/panels/news-panel"
import { VideosPanel } from "@/components/panels/videos-panel"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { fetchCertificates } from "@/lib/api/certificate"
import { fetchNewsHtml } from "@/lib/api/news"
import { fetchVideos } from "@/lib/api/video"

export default async function Page() {
    const [certificates, news, videos] = await Promise.all([
        fetchCertificates(),
        fetchNewsHtml(),
        fetchVideos(),
    ]);

    return (
        <div className="h-screen w-full overflow-hidden p-2">
            <ResizablePanelGroup
                orientation="horizontal"
                className="h-full w-full rounded-2xl border"
            >
                <ResizablePanel defaultSize={20}>
                    <CertificatesPanel initialData={certificates} />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={55} minSize={55}>
                    <NewsPanel initialData={news} />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={25}>
                    <VideosPanel initialData={videos} />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
