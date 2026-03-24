import TopNavBar from "@/shared/ui/TopNavBar";
import Footer from "@/shared/ui/Footer";
import PageTransition from "@/shared/ui/PageTransition";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNavBar />
      <main className="flex-1 pt-[62px] md:pt-[72px]">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
