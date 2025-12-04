import Sidebar from "@/components/layout/Sidebar";
import Taskbar from "@/components/layout/Taskbar";

export default function IosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#181A1B]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {children}
        <Taskbar />
      </div>
    </div>
  );
}
