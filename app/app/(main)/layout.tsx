import TopNavBar from "@/shared/components/TopNavBar";
import Footer from "@/shared/components/Footer";
import PageTransition from "@/shared/components/PageTransition";

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
