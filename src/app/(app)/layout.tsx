import AppNav from "@/components/AppNav";
import LegalFooter from "@/components/LegalFooter";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col md:flex-row">
      <AppNav />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 max-w-4xl mx-auto w-full">{children}</main>
        <LegalFooter />
      </div>
    </div>
  );
}
