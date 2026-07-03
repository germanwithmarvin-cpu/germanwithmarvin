import AppNav from "@/components/AppNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col md:flex-row">
      <AppNav />
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">{children}</main>
    </div>
  );
}
