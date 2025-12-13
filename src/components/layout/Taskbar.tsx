export default function Taskbar() {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#23272A] border-t border-[#23272A] flex items-center justify-between px-4 py-2 z-50">
      <div className="flex items-center gap-2">
        <span className="text-[#19BFFF] font-bold">Exiled IOS</span>
        {/* Ajoute ici les icônes dynamiques des apps ouvertes */}
      </div>
      <div className="flex items-center gap-2">
        {/* Boutons utilisateur, notifications, etc. */}
        <button className="px-3 py-1 rounded bg-[#19BFFF] text-white font-semibold hover:bg-[#0ea5e9] transition">
          Menu
        </button>
      </div>
    </div>
  );
}
