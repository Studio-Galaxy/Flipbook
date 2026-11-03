import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { ScrollCalm } from "@/components/site/ScrollCalm";

// The library's pages. The reader (/[subject]/[cls]) has its own full-screen layout.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <ScrollCalm />
      {children}
      <Footer />
    </>
  );
}
