import { useState } from "react";
import Sidebar from "@/components/messenger/Sidebar";
import ChatList from "@/components/messenger/ChatList";
import ChatWindow from "@/components/messenger/ChatWindow";
import ContactsPanel from "@/components/messenger/ContactsPanel";
import SettingsPanel from "@/components/messenger/SettingsPanel";
import ProfilePanel from "@/components/messenger/ProfilePanel";
import AuthScreen from "@/components/messenger/AuthScreen";

export type Tab = "chats" | "contacts" | "settings" | "profile";

export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  status: "online" | "offline" | "away";
  lastSeen?: string;
}

export interface Message {
  id: string;
  text: string;
  time: string;
  isOwn: boolean;
  status: "sent" | "delivered" | "read";
}

export interface Chat {
  id: string;
  user: User;
  messages: Message[];
  unread: number;
  pinned?: boolean;
}

const DEMO_CHATS: Chat[] = [
  {
    id: "1",
    user: { id: "u1", name: "Алексей Петров", username: "alexey_p", status: "online" },
    unread: 3,
    pinned: true,
    messages: [
      { id: "m1", text: "Привет! Как дела?", time: "10:24", isOwn: false, status: "read" },
      { id: "m2", text: "Всё отлично, спасибо! Работаю над новым проектом 🚀", time: "10:25", isOwn: true, status: "read" },
      { id: "m3", text: "Звучит круто! Расскажи подробнее", time: "10:27", isOwn: false, status: "read" },
      { id: "m4", text: "Это мессенджер с тёмной темой 😄", time: "10:28", isOwn: true, status: "delivered" },
      { id: "m5", text: "Когда покажешь?", time: "10:30", isOwn: false, status: "read" },
      { id: "m6", text: "Уже сейчас!", time: "10:31", isOwn: false, status: "read" },
      { id: "m7", text: "Жду с нетерпением!", time: "10:32", isOwn: false, status: "read" },
    ],
  },
  {
    id: "2",
    user: { id: "u2", name: "Мария Смирнова", username: "masha_s", status: "away" },
    unread: 0,
    messages: [
      { id: "m1", text: "Документы отправила на почту", time: "Вчера", isOwn: false, status: "read" },
      { id: "m2", text: "Получила, спасибо!", time: "Вчера", isOwn: true, status: "read" },
    ],
  },
  {
    id: "3",
    user: { id: "u3", name: "Команда разработки", username: "dev_team", status: "online" },
    unread: 12,
    messages: [
      { id: "m1", text: "Деплой прошёл успешно ✅", time: "09:15", isOwn: false, status: "read" },
      { id: "m2", text: "Отлично! Проверяю прямо сейчас", time: "09:20", isOwn: true, status: "read" },
      { id: "m3", text: "Есть небольшие правки по UI", time: "09:45", isOwn: false, status: "read" },
    ],
  },
  {
    id: "4",
    user: { id: "u4", name: "Дмитрий Козлов", username: "dima_k", status: "offline", lastSeen: "2 часа назад" },
    unread: 0,
    messages: [
      { id: "m1", text: "Встреча перенесена на пятницу", time: "Пн", isOwn: false, status: "read" },
    ],
  },
  {
    id: "5",
    user: { id: "u5", name: "Анна Новикова", username: "anna_n", status: "online" },
    unread: 1,
    messages: [
      { id: "m1", text: "Привет! Видела твой новый проект 🔥", time: "11:00", isOwn: false, status: "read" },
    ],
  },
];

const DEMO_CONTACTS: User[] = [
  { id: "u1", name: "Алексей Петров", username: "alexey_p", status: "online" },
  { id: "u5", name: "Анна Новикова", username: "anna_n", status: "online" },
  { id: "u3", name: "Команда разработки", username: "dev_team", status: "online" },
  { id: "u2", name: "Мария Смирнова", username: "masha_s", status: "away" },
  { id: "u4", name: "Дмитрий Козлов", username: "dima_k", status: "offline", lastSeen: "2 часа назад" },
  { id: "u6", name: "Игорь Васильев", username: "igor_v", status: "offline", lastSeen: "вчера" },
  { id: "u7", name: "Светлана Орлова", username: "sveta_o", status: "online" },
];

const DEMO_ME: User = {
  id: "me",
  name: "Вы",
  username: "my_account",
  status: "online",
};

export default function Index() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("chats");
  const [chats, setChats] = useState<Chat[]>(DEMO_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>("1");
  const [searchQuery, setSearchQuery] = useState("");

  const handleAuth = (user: User) => {
    setCurrentUser(user);
    setIsAuthed(true);
  };

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  const handleSendMessage = (text: string) => {
    if (!activeChatId || !text.trim()) return;
    const newMsg: Message = {
      id: `m${Date.now()}`,
      text,
      time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      isOwn: true,
      status: "sent",
    };
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId ? { ...c, messages: [...c.messages, newMsg], unread: 0 } : c
      )
    );
  };

  const handleOpenChat = (userId: string) => {
    const existing = chats.find((c) => c.user.id === userId);
    if (existing) {
      setActiveChatId(existing.id);
      setActiveTab("chats");
    } else {
      const contact = DEMO_CONTACTS.find((c) => c.id === userId);
      if (!contact) return;
      const newChat: Chat = {
        id: `chat_${Date.now()}`,
        user: contact,
        messages: [],
        unread: 0,
      };
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      setActiveTab("chats");
    }
  };

  if (!isAuthed) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  const filteredChats = chats.filter((c) =>
    c.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden animate-fade-in">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadCount={chats.reduce((acc, c) => acc + c.unread, 0)}
        currentUser={currentUser || DEMO_ME}
      />

      <div className="flex flex-1 overflow-hidden">
        {activeTab === "chats" && (
          <>
            <ChatList
              chats={filteredChats}
              activeChatId={activeChatId}
              onSelectChat={(id) => setActiveChatId(id)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            <ChatWindow
              chat={activeChat}
              onSend={handleSendMessage}
            />
          </>
        )}
        {activeTab === "contacts" && (
          <ContactsPanel contacts={DEMO_CONTACTS} onOpenChat={handleOpenChat} />
        )}
        {activeTab === "settings" && <SettingsPanel />}
        {activeTab === "profile" && <ProfilePanel user={currentUser || DEMO_ME} />}
      </div>
    </div>
  );
}
