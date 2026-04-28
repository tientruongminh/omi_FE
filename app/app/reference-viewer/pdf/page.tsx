import PdfPageViewer from '@/widgets/infinite-canvas/ui/PdfPageViewer';

function getSingleParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PdfReferenceViewerPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sourceUrl = getSingleParam(params.source);
  const sourceLabel = getSingleParam(params.label) || 'Tai lieu PDF';
  const page = Number(getSingleParam(params.page) || '1');
  const searchText = getSingleParam(params.search);

  return (
    <main className="h-screen bg-[#F5F0EB]">
      <PdfPageViewer
        sourceUrl={sourceUrl}
        sourceLabel={sourceLabel}
        initialPage={page}
        searchText={searchText}
        standalone
      />
    </main>
  );
}
