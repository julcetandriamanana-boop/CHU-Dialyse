import Sidebar from "@/src/components/sidebar/Sidebar";
import NotificationBell from "@/src/components/notifications/NotificationBell";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      {/* Cloche de notification fixe en haut à droite */}
      <div className="fixed top-3 right-4 z-50">
        <NotificationBell />
      </div>
      <main className="lg:ml-64 min-h-screen overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
