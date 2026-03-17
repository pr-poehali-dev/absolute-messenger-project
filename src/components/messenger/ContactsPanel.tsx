import { useState } from "react";
import { User } from "@/pages/Index";
import Avatar from "./Avatar";
import Icon from "@/components/ui/icon";

interface ContactsPanelProps {
  contacts: User[];
  onOpenChat: (userId: string) => void;
}

export default function ContactsPanel({ contacts, onOpenChat }: ContactsPanelProps) {
  const [search, setSearch] = useState("");

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  const online = filtered.filter((c) => c.status === "online");
  const others = filtered.filter((c) => c.status !== "online");

  const statusLabel = { online: "в сети", away: "отошёл", offline: "не в сети" };

  const renderContact = (user: User) => (
    <div key={user.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary rounded-xl transition-all group">
      <Avatar user={user} size="md" showStatus />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{user.name}</p>
        <p className="text-xs text-muted-foreground">
          @{user.username} · {user.lastSeen ? `был(а) ${user.lastSeen}` : statusLabel[user.status]}
        </p>
      </div>
      <button
        onClick={() => onOpenChat(user.id)}
        className="opacity-0 group-hover:opacity-100 w-8 h-8 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg flex items-center justify-center transition-all"
        title="Написать"
      >
        <Icon name="MessageCircle" size={15} />
      </button>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-border bg-card/30">
        <h2 className="text-lg font-bold text-foreground mb-3">Контакты</h2>
        <div className="relative">
          <Icon name="Search" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Найти контакт..."
            className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all max-w-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {online.length > 0 && (
          <>
            <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest px-2 mb-2">
              В сети — {online.length}
            </p>
            <div className="space-y-0.5 mb-4">{online.map(renderContact)}</div>
          </>
        )}
        {others.length > 0 && (
          <>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-2">
              Остальные — {others.length}
            </p>
            <div className="space-y-0.5">{others.map(renderContact)}</div>
          </>
        )}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Icon name="UserSearch" size={36} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Контакты не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}
