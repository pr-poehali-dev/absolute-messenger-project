import { User } from "@/pages/Index";

const COLORS = [
  "from-violet-600 to-indigo-600",
  "from-cyan-600 to-blue-600",
  "from-emerald-600 to-teal-600",
  "from-rose-600 to-pink-600",
  "from-amber-600 to-orange-600",
  "from-purple-600 to-fuchsia-600",
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return COLORS[hash % COLORS.length];
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

interface AvatarProps {
  user: User;
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
}

export default function Avatar({ user, size = "md", showStatus = false }: AvatarProps) {
  const sizeClass = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
  }[size];

  const statusSize = size === "lg" ? "w-3.5 h-3.5 border-2" : "w-2.5 h-2.5 border-2";

  const statusColor = {
    online: "bg-emerald-400",
    away: "bg-amber-400",
    offline: "bg-slate-500",
  }[user.status];

  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizeClass} rounded-full bg-gradient-to-br ${getColor(user.name)} flex items-center justify-center font-semibold text-white`}>
        {getInitials(user.name)}
      </div>
      {showStatus && (
        <span className={`absolute bottom-0 right-0 ${statusSize} ${statusColor} rounded-full border-background`} />
      )}
    </div>
  );
}
