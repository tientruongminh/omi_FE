import TopNavBar from "@/components/TopNavBar";
import Footer from "@/components/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNavBar />
      <main className="flex-1 pt-[62px] md:pt-[72px]">
        {children}
      </main>
      <Footer />
    </>
  );
}
