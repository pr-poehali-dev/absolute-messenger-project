import { useState } from "react";
import { User } from "@/pages/Index";
import Avatar from "./Avatar";
import Icon from "@/components/ui/icon";

interface ProfilePanelProps {
  user: User;
}

export default function ProfilePanel({ user }: ProfilePanelProps) {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState("Люблю общаться и создавать крутые проекты ✨");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-border bg-card/30">
        <h2 className="text-lg font-bold text-foreground">Мой профиль</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-lg">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="relative">
            <Avatar user={{ ...user, name }} size="lg" showStatus />
            <button className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all">
              <Icon name="Camera" size={12} className="text-white" />
            </button>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground">{name || user.name}</h3>
            <p className="text-sm text-muted-foreground">@{username || user.username}</p>
            <span className="inline-flex items-center gap-1.5 mt-2 text-xs text-emerald-400">
              <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              В сети
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Личные данные</h4>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Имя</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Никнейм</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl pl-8 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">О себе</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
              saved
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
          >
            {saved ? (
              <span className="flex items-center justify-center gap-2">
                <Icon name="Check" size={16} /> Сохранено!
              </span>
            ) : "Сохранить изменения"}
          </button>
        </div>
      </div>
    </div>
  );
}
