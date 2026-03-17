import { useState } from "react";
import { User } from "@/pages/Index";
import Icon from "@/components/ui/icon";
import { api } from "@/lib/api";

interface AuthScreenProps {
  onAuth: (user: User, token: string) => void;
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (!name.trim()) { setError("Введите имя"); return; }
      if (!username.trim()) { setError("Введите никнейм"); return; }
      if (password.length < 4) { setError("Пароль минимум 4 символа"); return; }
    } else {
      if (!username.trim() || !password.trim()) { setError("Заполните все поля"); return; }
    }

    setLoading(true);
    try {
      let data;
      if (mode === "register") {
        data = await api.auth.register(username.trim().toLowerCase(), name.trim(), password);
      } else {
        data = await api.auth.login(username.trim().toLowerCase(), password);
      }
      onAuth({ ...data.user, id: String(data.user.id) }, data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сервера");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm px-4 animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-4 glow">
            <Icon name="MessageCircle" size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Messenger</h1>
          <p className="text-muted-foreground text-sm mt-1">Общайтесь без границ</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl">
          <div className="flex bg-secondary rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "login" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Войти
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "register" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Имя</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван Иванов"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Никнейм</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
            {error && (
              <p className="text-destructive text-xs flex items-center gap-1.5">
                <Icon name="AlertCircle" size={14} />
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold py-3 rounded-xl transition-all active:scale-95 mt-2 flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {mode === "login" ? "Войти" : "Создать аккаунт"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
