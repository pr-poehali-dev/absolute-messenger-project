import { useState, useRef, useEffect } from "react";
import { Chat } from "@/pages/Index";
import Avatar from "./Avatar";
import Icon from "@/components/ui/icon";

interface ChatWindowProps {
  chat: Chat | null;
  onSend: (text: string) => void;
}

function MessageStatusIcon({ status }: { status: string }) {
  if (status === "sent") return <Icon name="Check" size={12} className="text-muted-foreground" />;
  if (status === "delivered") return <Icon name="CheckCheck" size={12} className="text-muted-foreground" />;
  if (status === "read") return <Icon name="CheckCheck" size={12} className="text-primary" />;
  return null;
}

export default function ChatWindow({ chat, onSend }: ChatWindowProps) {
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background text-center p-8">
        <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mb-4">
          <Icon name="MessageCircle" size={36} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Выберите чат</h3>
        <p className="text-muted-foreground text-sm max-w-xs">Выберите диалог из списка слева, чтобы начать общение</p>
      </div>
    );
  }

  const statusText = {
    online: "в сети",
    away: "отошёл",
    offline: chat.user.lastSeen ? `был(а) ${chat.user.lastSeen}` : "не в сети",
  }[chat.user.status];

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
        <Avatar user={chat.user} size="md" showStatus />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{chat.user.name}</h3>
          <p className={`text-xs ${chat.user.status === "online" ? "text-emerald-400" : "text-muted-foreground"}`}>
            {statusText}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
            <Icon name="Phone" size={16} />
          </button>
          <button className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
            <Icon name="Video" size={16} />
          </button>
          <button className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
            <Icon name="MoreVertical" size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
        {chat.messages.map((msg, i) => {
          const prevMsg = chat.messages[i - 1];
          const showDate = !prevMsg;
          const isGrouped = prevMsg && prevMsg.isOwn === msg.isOwn;

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="flex justify-center my-3">
                  <span className="text-[11px] text-muted-foreground bg-secondary px-3 py-1 rounded-full">Сегодня</span>
                </div>
              )}
              <div className={`flex ${msg.isOwn ? "justify-end" : "justify-start"} ${isGrouped ? "mt-0.5" : "mt-2"} animate-msg-in`}>
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.isOwn
                      ? "bg-primary/25 text-foreground rounded-br-sm"
                      : "bg-card border border-border text-foreground rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  <div className={`flex items-center gap-1 mt-1 ${msg.isOwn ? "justify-end" : "justify-start"}`}>
                    <span className="text-[11px] text-muted-foreground">{msg.time}</span>
                    {msg.isOwn && <MessageStatusIcon status={msg.status} />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-3 border-t border-border bg-card/30 flex-shrink-0">
        <div className="flex items-end gap-2 bg-secondary rounded-2xl px-4 py-2 border border-border focus-within:border-primary/50 transition-all">
          <button className="text-muted-foreground hover:text-foreground transition-colors mb-1.5 flex-shrink-0">
            <Icon name="Paperclip" size={18} />
          </button>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Написать сообщение..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none py-1.5 max-h-32"
            style={{ minHeight: "24px" }}
          />
          <button className="text-muted-foreground hover:text-foreground transition-colors mb-1.5 flex-shrink-0">
            <Icon name="Smile" size={18} />
          </button>
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="w-8 h-8 bg-primary hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed text-primary-foreground rounded-xl flex items-center justify-center transition-all active:scale-90 flex-shrink-0 mb-0.5"
          >
            <Icon name="Send" size={15} />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-1.5">Enter — отправить · Shift+Enter — новая строка</p>
      </div>
    </div>
  );
}
