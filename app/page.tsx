import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./components/home/HeroSection";
import TrustSection from "./components/home/TrustSection";
import BrowseSection from "./components/home/BrowseSection";
import HowItWorksSection from "./components/home/HowItWorksSection";
import StoriesSection from "./components/home/StoriesSection";
import CtaSection from "./components/home/CtaSection";

/* =====================================================================
   SAMMATHAM - Matrimony home page
   Design idea: Kerala's kasavu (cream cloth with a gold border) meets a
   deep wine floral palette. Profiles sit inside arched "windows".
   Colors and fonts are defined in globals.css.
   ===================================================================== */

export default function HomePage() {
  return (
    <main>
      <Header />
      <HeroSection />
      {/* Gold-bordered strip, like the edge of a kasavu mundu */}
      <div className="kasavu" aria-hidden="true" />
      <TrustSection />
      <BrowseSection />
      <HowItWorksSection />
      <StoriesSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
