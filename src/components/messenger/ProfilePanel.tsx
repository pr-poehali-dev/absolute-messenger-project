import { useState } from "react";
import { User } from "@/pages/Index";
import Avatar from "./Avatar";
import Icon from "@/components/ui/icon";

interface ProfilePanelProps {
  user: User;
  onUpdate: (updates: { name?: string; username?: string; bio?: string }) => Promise<void>;
}

export default function ProfilePanel({ user, onUpdate }: ProfilePanelProps) {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || "");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      await onUpdate({ name, username, bio });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-border bg-card/30">
        <h2 className="text-lg font-bold text-foreground">Мой профиль</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-lg">
        <div className="flex flex-col items-center gap-4 mb-8">
          <Avatar user={{ ...user, name }} size="lg" showStatus />
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
                placeholder="Расскажите о себе..."
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all resize-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-destructive text-xs flex items-center gap-1.5 px-1">
              <Icon name="AlertCircle" size={14} />
              {error}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${
              saved
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-60"
            }`}
          >
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saved ? (
              <><Icon name="Check" size={16} /> Сохранено!</>
            ) : "Сохранить изменения"}
          </button>
        </div>
      </div>
    </div>
  );
}
