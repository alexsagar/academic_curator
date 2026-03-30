import AdminSidebar from "@/components/admin/AdminSidebar";
import Icon from "@/components/ui/Icon";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-container-low/30">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-surface-container-lowest border-b border-outline-variant/10 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-sm font-bold tracking-widest uppercase text-on-surface-variant">System Control</h2>
          <div className="flex items-center gap-4">
            <button className="relative text-on-surface-variant hover:text-primary transition-colors" type="button">
              <Icon name="notifications" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full outline outline-2 outline-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              A
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
