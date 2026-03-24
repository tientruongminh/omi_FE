import { TopNavBar } from "@/widgets/header";
import { Footer } from "@/widgets/footer";
import PageTransition from "@/shared/ui/PageTransition";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNavBar />
      <main className="flex-1 pt-[62px] md:pt-[72px] bg-[#FAF9F7]">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}


