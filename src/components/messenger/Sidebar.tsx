import { Tab } from "@/pages/Index";
import { User } from "@/pages/Index";
import Icon from "@/components/ui/icon";
import Avatar from "./Avatar";

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  unreadCount: number;
  currentUser: User;
}

const NAV = [
  { tab: "chats" as Tab, icon: "MessageCircle", label: "Чаты" },
  { tab: "contacts" as Tab, icon: "Users", label: "Контакты" },
  { tab: "settings" as Tab, icon: "Settings", label: "Настройки" },
];

export default function Sidebar({ activeTab, onTabChange, unreadCount, currentUser }: SidebarProps) {
  return (
    <div className="flex flex-col w-16 h-full bg-[hsl(240_10%_3%)] border-r border-border items-center py-4 gap-2 flex-shrink-0">
      <div className="mb-4">
        <div className="w-9 h-9 bg-gradient-to-br from-primary to-violet-500 rounded-xl flex items-center justify-center">
          <Icon name="MessageCircle" size={18} className="text-white" />
        </div>
      </div>

      <div className="flex flex-col gap-1 flex-1 w-full px-2">
        {NAV.map(({ tab, icon, label }) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            title={label}
            className={`relative w-full aspect-square rounded-xl flex items-center justify-center transition-all group ${
              activeTab === tab
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Icon name={icon} size={20} />
            {tab === "chats" && unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => onTabChange("profile")}
        title="Профиль"
        className={`mt-auto transition-all ${activeTab === "profile" ? "ring-2 ring-primary rounded-full" : "opacity-70 hover:opacity-100"}`}
      >
        <Avatar user={currentUser} size="sm" showStatus />
      </button>
    </div>
  );
}
