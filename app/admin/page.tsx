import { AdminDashboard } from "@/components/AdminDashboard";
import { Navbar } from "@/components/Navbar";

export const metadata = {
  title: "Admin Portal | ReviewBoost AI",
  description: "Multi-tenant Google Maps review accelerator, QR card generator, and grievance inbox.",
};

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <AdminDashboard />
      </main>
    </div>
  );
}
