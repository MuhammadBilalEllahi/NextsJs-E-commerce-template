import { useAppContext } from "@/lib/providers/context/AppContext";
import { LogOut } from "lucide-react";

export default function LogOutButton() {
  const { logout } = useAppContext();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
    >
      <LogOut className="size-4" />
      Logout
    </button>
  );
}
