import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/messenger/Sidebar";
import ChatList from "@/components/messenger/ChatList";
import ChatWindow from "@/components/messenger/ChatWindow";
import ContactsPanel from "@/components/messenger/ContactsPanel";
import SettingsPanel from "@/components/messenger/SettingsPanel";
import ProfilePanel from "@/components/messenger/ProfilePanel";
import AuthScreen from "@/components/messenger/AuthScreen";
import { api } from "@/lib/api";

export type Tab = "chats" | "contacts" | "settings" | "profile";

export interface User {
  id: string;
  name: string;
  username: string;
  bio?: string;
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
  lastMessage?: { text: string; time: string; isOwn: boolean } | null;
}

export default function Index() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("chats");
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadChats = useCallback(async () => {
    try {
      const data = await api.chats.list();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setChats((prev) => data.chats.map((c: any) => ({ ...c, messages: prev.find((p) => p.id === c.id)?.messages || [] })));
    } catch (_e) { /* ignore */ }
  }, []);

  const loadContacts = useCallback(async () => {
    try {
      const data = await api.auth.getUsers();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setContacts(data.users.map((u: any) => ({ ...u, id: String(u.id) })));
    } catch (_e) { /* ignore */ }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("session_token");
    if (!token) { setLoading(false); return; }
    api.auth.me().then((data) => {
      setCurrentUser({ ...data.user, id: String(data.user.id) });
      setIsAuthed(true);
      setLoading(false);
    }).catch(() => {
      localStorage.removeItem("session_token");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!isAuthed) return;
    loadChats();
    loadContacts();
    const interval = setInterval(() => { loadChats(); loadContacts(); }, 5000);
    return () => clearInterval(interval);
  }, [isAuthed, loadChats, loadContacts]);

  useEffect(() => {
    if (!activeChatId) return;
    const loadMessages = async () => {
      try {
        const data = await api.messages.list(activeChatId);
        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChatId ? { ...c, messages: data.messages, unread: 0 } : c
          )
        );
      } catch (_e) { /* ignore */ }
    };
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [activeChatId]);

  const handleAuth = (user: User, token: string) => {
    localStorage.setItem("session_token", token);
    setCurrentUser(user);
    setIsAuthed(true);
  };

  const handleSendMessage = async (text: string) => {
    if (!activeChatId || !text.trim()) return;
    try {
      const data = await api.messages.send(activeChatId, text);
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? { ...c, messages: [...c.messages, data.message] }
            : c
        )
      );
    } catch (_e) { /* ignore */ }
  };

  const handleOpenChat = async (userId: string) => {
    try {
      const existing = chats.find((c) => c.user.id === userId);
      if (existing) {
        setActiveChatId(existing.id);
        setActiveTab("chats");
        return;
      }
      const data = await api.chats.open(Number(userId));
      const newChat: Chat = {
        id: data.chatId,
        user: { ...data.user, id: String(data.user.id) },
        messages: [],
        unread: 0,
      };
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(data.chatId);
      setActiveTab("chats");
    } catch (_e) { /* ignore */ }
  };

  const handleUpdateProfile = async (updates: { name?: string; username?: string; bio?: string }) => {
    const data = await api.auth.updateMe(updates);
    setCurrentUser({ ...data.user, id: String(data.user.id) });
  };

  const handleLogout = async () => {
    await api.auth.logout().catch(() => {});
    localStorage.removeItem("session_token");
    setIsAuthed(false);
    setCurrentUser(null);
    setChats([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthed) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  const filteredChats = chats.filter((c) =>
    c.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const totalUnread = chats.reduce((acc, c) => acc + c.unread, 0);

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden animate-fade-in">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadCount={totalUnread}
        currentUser={currentUser!}
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
          <ContactsPanel contacts={contacts} onOpenChat={handleOpenChat} />
        )}
        {activeTab === "settings" && <SettingsPanel onLogout={handleLogout} />}
        {activeTab === "profile" && (
          <ProfilePanel user={currentUser!} onUpdate={handleUpdateProfile} />
        )}
      </div>
    </div>
  );
}