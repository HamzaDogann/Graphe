"use client";

import { useState } from "react";
import { Pencil, Check } from "lucide-react";
import { useCanvasEditorStore } from "@/store/useCanvasEditorStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useUserStore } from "@/store/useUserStore";
import { useUserAvatar } from "@/hooks";
import styles from "./PropertyContents.module.scss";

export const InformationContent = () => {
  const { canvasId, title, description, setTitle, setDescription } =
    useCanvasEditorStore();
  const { canvases, updateCanvasWithSync } = useCanvasStore();
  const { user } = useUserStore();
  const { hasImage, imageUrl, initials, gradient } = useUserAvatar();

  // Edit states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description || "");

  // Get the canvas from the store to access createdAt
  const canvas = canvases.find((c) => c.id === canvasId);

  // Format date
  const formatDate = (date: Date | undefined) => {
    if (!date) return "Unknown";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleTitleEdit = () => {
    setEditTitle(title);
    setIsEditingTitle(true);
  };

  const handleTitleSave = async () => {
    if (!canvasId || editTitle === title) {
      setIsEditingTitle(false);
      return;
    }

    // Update editor store (UI)
    setTitle(editTitle);
    setIsEditingTitle(false);

    // Sync to DB in background
    await updateCanvasWithSync(canvasId, { title: editTitle });
  };

  const handleDescriptionEdit = () => {
    setEditDescription(description || "");
    setIsEditingDescription(true);
  };

  const handleDescriptionSave = async () => {
    if (!canvasId || editDescription === (description || "")) {
      setIsEditingDescription(false);
      return;
    }

    // Update editor store (UI)
    setDescription(editDescription || null);
    setIsEditingDescription(false);

    // Sync to DB in background
    await updateCanvasWithSync(canvasId, {
      description: editDescription || undefined,
    });
  };

  return (
    <div className={styles.infoWrapper}>
      {/* Creator Section - Top */}
      <div className={styles.infoField}>
        <label className={styles.infoLabel}>Creator</label>
        <div className={styles.infoCreator}>
          {hasImage && imageUrl ? (
            <img
              src={imageUrl}
              alt={user?.name || "User"}
              className={styles.infoCreatorAvatar}
            />
          ) : (
            <div
              className={styles.infoCreatorAvatarPlaceholder}
              style={{ background: gradient }}
            >
              {initials}
            </div>
          )}
          <div className={styles.infoCreatorDetails}>
            <span className={styles.infoCreatorName}>
              {user?.name || "Anonymous"}
            </span>
            <span className={styles.infoCreatorEmail}>{user?.email || ""}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className={styles.infoDivider} />

      {/* Title */}
      <div className={styles.infoField}>
        <label className={styles.infoLabel}>Title</label>
        <div className={styles.infoFieldContent}>
          {isEditingTitle ? (
            <div className={styles.infoEditRow}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className={styles.infoEditInput}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
              />
              <button className={styles.infoSaveBtn} onClick={handleTitleSave}>
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div className={styles.infoValueRow}>
              <span className={styles.infoText}>
                {title || "Untitled Canvas"}
              </span>
              <button className={styles.infoEditBtn} onClick={handleTitleEdit}>
                <Pencil size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className={styles.infoField}>
        <label className={styles.infoLabel}>Description</label>
        <div className={styles.infoFieldContent}>
          {isEditingDescription ? (
            <div className={styles.infoEditRow}>
              <input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className={styles.infoEditInput}
                placeholder="Add a description..."
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleDescriptionSave()}
              />
              <button
                className={styles.infoSaveBtn}
                onClick={handleDescriptionSave}
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div className={styles.infoValueRow}>
              <span
                className={`${styles.infoText} ${!description ? styles.placeholder : ""}`}
              >
                {description || "No description"}
              </span>
              <button
                className={styles.infoEditBtn}
                onClick={handleDescriptionEdit}
              >
                <Pencil size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Created Date */}
      <div className={styles.infoField}>
        <label className={styles.infoLabel}>Created</label>
        <span className={styles.infoText}>{formatDate(canvas?.createdAt)}</span>
      </div>
    </div>
  );
};
