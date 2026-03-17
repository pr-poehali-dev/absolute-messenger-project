import { Chat } from "@/pages/Index";
import Avatar from "./Avatar";
import Icon from "@/components/ui/icon";

interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function ChatList({ chats, activeChatId, onSelectChat, searchQuery, onSearchChange }: ChatListProps) {
  const pinned = chats.filter((c) => c.pinned);
  const regular = chats.filter((c) => !c.pinned);

  const renderChat = (chat: Chat) => {
    const lastMsgFromHistory = chat.messages[chat.messages.length - 1];
    const preview = lastMsgFromHistory || chat.lastMessage;
    const isActive = chat.id === activeChatId;

    return (
      <button
        key={chat.id}
        onClick={() => onSelectChat(chat.id)}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left group ${
          isActive
            ? "bg-primary/15 border border-primary/20"
            : "hover:bg-secondary border border-transparent"
        }`}
      >
        <Avatar user={chat.user} size="md" showStatus />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-sm font-semibold truncate text-foreground">
              {chat.user.name}
            </span>
            <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-1">
              {preview?.time || ""}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground truncate flex-1">
              {preview ? (
                <>
                  {preview.isOwn && <span className="mr-1">Вы:</span>}
                  {preview.text}
                </>
              ) : (
                <span className="italic">Нет сообщений</span>
              )}
            </p>
            {chat.unread > 0 && (
              <span className="ml-2 min-w-5 h-5 bg-primary text-primary-foreground text-[11px] font-bold rounded-full flex items-center justify-center px-1 flex-shrink-0">
                {chat.unread}
              </span>
            )}
            {chat.pinned && chat.unread === 0 && (
              <Icon name="Pin" size={11} className="text-muted-foreground ml-1 flex-shrink-0" />
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="flex flex-col w-72 flex-shrink-0 h-full bg-card border-r border-border">
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <h2 className="text-base font-bold text-foreground mb-3">Сообщения</h2>
        <div className="relative">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск..."
            className="w-full bg-secondary border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {pinned.length > 0 && (
          <>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 py-1.5">Закреплённые</p>
            {pinned.map(renderChat)}
            {regular.length > 0 && (
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 py-1.5 mt-2">Все чаты</p>
            )}
          </>
        )}
        {regular.map(renderChat)}
        {chats.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm">
            <Icon name="MessageCircleDashed" size={32} className="mx-auto mb-2 opacity-40" />
            Ничего не найдено
          </div>
        )}
      </div>
    </div>
  );
}