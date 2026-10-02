import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Estimator } from "@/components/estimator/Estimator";
import { Process } from "@/components/sections/Process";
import { Coverage } from "@/components/sections/Coverage";
import { Trust } from "@/components/sections/Trust";
import { Contact, Faq } from "@/components/sections/FaqContact";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Services />
        <Estimator />
        <Process />
        <Coverage />
        <Trust />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
