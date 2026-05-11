import Sidebar from "@/src/components/sidebar/Sidebar";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 min-h-0 min-w-0 overflow-auto lg:ml-0">
        {children}
      </main>
    </div>
  );
}
