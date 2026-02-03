import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface Chat {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatState {
  // Active chat (currently being viewed)
  activeChat: Chat | null;
  
  // All chats list
  chats: Chat[];
  
  // Actions
  setActiveChat: (chat: Chat) => void;
  clearActiveChat: () => void;
  addChat: (chat: Chat) => void;
  updateChatName: (id: string, name: string) => void;
  removeChat: (id: string) => void;
  getChatById: (id: string) => Chat | undefined;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      activeChat: null,
      chats: [],
      
      setActiveChat: (chat) => set({ activeChat: chat }),
      clearActiveChat: () => set({ activeChat: null }),
      
      addChat: (chat) => set((state) => ({ 
        chats: [...state.chats, chat],
        activeChat: chat 
      })),
      
      updateChatName: (id, name) => set((state) => {
        const updatedChats = state.chats.map((chat) =>
          chat.id === id 
            ? { ...chat, name, updatedAt: new Date() }
            : chat
        );
        return {
          chats: updatedChats,
          activeChat: state.activeChat?.id === id
            ? { ...state.activeChat, name, updatedAt: new Date() }
            : state.activeChat
        };
      }),
      
      removeChat: (id) => set((state) => ({
        chats: state.chats.filter((c) => c.id !== id),
        activeChat: state.activeChat?.id === id ? null : state.activeChat
      })),
      
      getChatById: (id) => get().chats.find((c) => c.id === id),
    }),
    { name: "ChatStore" }
  )
);
