const URLS = {
  auth: "https://functions.poehali.dev/79d2d077-ecc4-4dd3-9375-4195eb19514e",
  chats: "https://functions.poehali.dev/00440851-932b-49f4-b7b0-a0eebccfb526",
  messages: "https://functions.poehali.dev/59371954-738c-4a15-ac6c-23c2b3fcd0ec",
};

function getToken() {
  return localStorage.getItem("session_token") || "";
}

async function request(base: string, path: string, method = "GET", body?: object) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Session-Token": getToken(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка сервера");
  return data;
}

export const api = {
  auth: {
    register: (username: string, name: string, password: string) =>
      request(URLS.auth, "/register", "POST", { username, name, password }),
    login: (username: string, password: string) =>
      request(URLS.auth, "/login", "POST", { username, password }),
    logout: () => request(URLS.auth, "/logout", "POST"),
    me: () => request(URLS.auth, "/me", "GET"),
    updateMe: (data: { name?: string; username?: string; bio?: string }) =>
      request(URLS.auth, "/me", "PUT", data),
    getUsers: () => request(URLS.auth, "/users", "GET"),
  },
  chats: {
    list: () => request(URLS.chats, "/", "GET"),
    open: (partnerId: number) => request(URLS.chats, "/", "POST", { partnerId }),
  },
  messages: {
    list: (chatId: string) => request(URLS.messages, `/?chatId=${chatId}`, "GET"),
    send: (chatId: string, text: string) =>
      request(URLS.messages, "/", "POST", { chatId, text }),
  },
};
