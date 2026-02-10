"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { ConfirmationModal } from "@/app/_components/ConfirmationModal";
import styles from "./SidebarChatList.module.scss";

interface Chat {
  id: string;
  title: string;
}

interface SidebarChatListProps {
  chats: Chat[];
  collapsed: boolean;
}

export function SidebarChatList({ chats, collapsed }: SidebarChatListProps) {
  const params = useParams();
  const router = useRouter();
  const activeChatId = params?.chatId as string | undefined;

  // Store actions
  const deleteChat = useChatStore((state) => state.deleteChat);
  const updateChatTitle = useChatStore((state) => state.updateChatTitle);

  // Tooltip state
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);

  // Rename state
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setOpenTooltipId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (editingChatId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingChatId]);

  // Handle 3-dot click
  const handleMenuClick = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenTooltipId(openTooltipId === chatId ? null : chatId);
  };

  // Handle delete click
  const handleDeleteClick = (e: React.MouseEvent, chat: Chat) => {
    e.preventDefault();
    e.stopPropagation();
    setChatToDelete(chat);
    setDeleteModalOpen(true);
    setOpenTooltipId(null);
  };

  // Confirm delete - Optimistic: close modal immediately, delete in background
  const handleConfirmDelete = () => {
    if (!chatToDelete) return;

    const chatId = chatToDelete.id;
    const wasActive = chatId === activeChatId;

    // Immediately close modal and clear state
    setDeleteModalOpen(false);
    setChatToDelete(null);

    // Navigate away if this was the active chat
    if (wasActive) {
      router.push("/dashboard");
    }

    // Fire-and-forget: delete in background (store already does optimistic update)
    deleteChat(chatId);
  };

  // Handle rename click
  const handleRenameClick = (e: React.MouseEvent, chat: Chat) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditValue(chat.title);
    setOpenTooltipId(null);
  };

  // Save rename
  const handleSaveRename = useCallback(async () => {
    if (!editingChatId) return;
    const trimmedValue = editValue.trim();
    const currentChat = chats.find((c) => c.id === editingChatId);

    // Önce editing'i kapat
    setEditingChatId(null);

    if (trimmedValue && currentChat && trimmedValue !== currentChat.title) {
      updateChatTitle(editingChatId, trimmedValue);
    }
  }, [editingChatId, editValue, chats, updateChatTitle]);

  // Handle key press for rename
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveRename();
    } else if (e.key === "Escape") {
      setEditingChatId(null);
    }
  };

  if (collapsed) {
    return (
      <div className={styles.collapsedList}>
        {chats.slice(0, 5).map((chat) => (
          <Link
            key={chat.id}
            href={`/dashboard/chats/${chat.id}`}
            className={`${styles.collapsedItem} ${chat.id === activeChatId ? styles.active : ""}`}
            title={chat.title}
          >
            <span className={styles.chatArrow}>
              <ChevronRight size={14} />
            </span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className={styles.chatList}>
        {chats.map((chat) => (
          <div key={chat.id} className={styles.chatItemWrapper}>
            {editingChatId === chat.id ? (
              // Edit mode
              <div className={`${styles.chatItem} ${styles.editing}`}>
                <span className={styles.chatArrow}>
                  <ChevronRight size={14} />
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSaveRename}
                  className={styles.editInput}
                />
              </div>
            ) : (
              // Normal mode
              <Link
                href={`/dashboard/chats/${chat.id}`}
                className={`${styles.chatItem} ${chat.id === activeChatId ? styles.active : ""}`}
              >
                <span className={styles.chatArrow}>
                  <ChevronRight size={14} />
                </span>
                <span className={styles.chatTitle}>{chat.title}</span>

                {/* 3-dot menu button */}
                <button
                  className={styles.menuBtn}
                  onClick={(e) => handleMenuClick(e, chat.id)}
                >
                  <MoreHorizontal size={16} />
                </button>
              </Link>
            )}

            {/* Tooltip Menu */}
            <AnimatePresence>
              {openTooltipId === chat.id && (
                <motion.div
                  ref={tooltipRef}
                  className={styles.tooltip}
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <button
                    className={styles.tooltipItem}
                    onClick={(e) => handleRenameClick(e, chat)}
                  >
                    <Pencil size={14} />
                    <span>Rename</span>
                  </button>
                  <button
                    className={`${styles.tooltipItem} ${styles.danger}`}
                    onClick={(e) => handleDeleteClick(e, chat)}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setChatToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Chat"
        message={`Are you sure you want to delete "${chatToDelete?.title || "this chat"}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
