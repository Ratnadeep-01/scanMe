import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminAuthGuard } from "@/components/AdminAuthGuard";
import { Navbar } from "@/components/Navbar";

export const metadata = {
  title: "Management Console | ReviewFlow",
  description: "Restricted management portal for venue settings, QR stand cards, and customer feedback shielding.",
};

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <AdminAuthGuard>
          <AdminDashboard />
        </AdminAuthGuard>
      </main>
    </div>
  );
}
