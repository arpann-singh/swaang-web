import Team from "@/components/Team";
import Header from "@/components/Header";
import Footer from "@/components/ui/Footer";

export default function TeamPage() {
  return (
    <main className="bg-[#FFF9F0] min-h-screen">
      <Header />
      <div className="pt-40">
        <Team />
      </div>
    </main>
  );
}
