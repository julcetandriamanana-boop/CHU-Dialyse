import Sidebar from '../../components/sidebar/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar fixe */}
      <Sidebar />
      {/* Contenu principal */}
      <main className="flex-1 lg:ml-0">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}