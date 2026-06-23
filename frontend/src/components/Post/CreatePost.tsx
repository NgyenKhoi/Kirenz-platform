import React, { useRef, useState, useEffect } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import { postService } from "../../services/post.service";
import { getErrorMessage } from "../../utils/post.utils";
import { fallbackAvatar } from "../../constants/post.constants";
import { PrivacyDropdown } from "../common/PrivacyDropdown";
import { PostResponse } from "../../types/post.types";
import { ConfirmDialog } from "../common/ConfirmDialog";

interface SelectedPostImage {
  id: string;
  file: File;
  previewUrl: string;
}

interface CreatePostProps {
  user: any; 
  profileName?: string;
  className?: string;
  onPostCreated?: (post: PostResponse) => void;
  onCreated?: (post: PostResponse) => void;
  onMessage?: (msg: string | null) => void;
  onSuccess?: (msg: string | null) => void;
  onError: (err: string | null) => void;
}

export function CreatePost({
  user,
  profileName,
  className,
  onPostCreated,
  onCreated,
  onMessage,
  onSuccess,
  onError,
}: CreatePostProps) {
  const [content, setContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<SelectedPostImage[]>([]);
  const selectedImagesRef = useRef<SelectedPostImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postPrivacy, setPostPrivacy] = useState<
    "PUBLIC" | "FRIENDS" | "PRIVATE"
  >("PUBLIC");
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);

  const effectiveProfileName = profileName || user?.displayName || user?.username || "there";

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(
    () => () => {
      selectedImagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl),
      );
    },
    [],
  );

  const handleSelectImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from<File>(event.target.files || []).filter((file) =>
      file.type.startsWith("image/"),
    );
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    setSelectedImages((current) =>
      [
        ...current,
        ...files.map((file) => ({
          id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ].slice(0, 10),
    );
  };

  const removeSelectedImage = (imageId: string) => {
    setSelectedImages((current) => {
      const removed = current.find((image) => image.id === imageId);
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return current.filter((image) => image.id !== imageId);
    });
  };

  const handleCreateClick = (event: React.FormEvent) => {
    event.preventDefault();
    onError(null);
    onMessage?.(null);
    onSuccess?.(null);

    if (!content.trim() && selectedImages.length === 0) {
      onError("Post content or at least one image is required.");
      return;
    }

    setShowCreateConfirm(true);
  };

  const handleConfirmCreate = async () => {
    setShowCreateConfirm(false);
    setIsSubmitting(true);
    try {
      const uploadedMedia =
        selectedImages.length > 0
          ? await postService.uploadImages(
            selectedImages.map((image) => image.file),
          )
          : [];
      const created = await postService.create({
        content,
        media: uploadedMedia.map((media) => ({
          type: media.type,
          url: media.url,
          publicId: media.publicId,
        })),
      });
      onPostCreated?.(created);
      onCreated?.(created);
      setContent("");
      selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      setSelectedImages([]);
      onMessage?.("Post created successfully.");
      onSuccess?.("Post created successfully.");
    } catch (err) {
      onError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleCreateClick}
      className={`bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] ${className || ""}`}
    >
      <div className="flex gap-4 mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
          <img
            alt="Profile"
            src={user?.avatarUrl || fallbackAvatar}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={3}
          placeholder={`What's on your mind, ${effectiveProfileName}?`}
          className="w-full bg-surface-container-low focus:bg-surface-container-high text-left px-6 py-3 rounded-3xl text-on-surface text-base font-medium transition-colors border-none outline-none resize-none focus:ring-2 focus:ring-primary-container"
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleSelectImages}
        className="hidden"
      />

      {selectedImages.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {selectedImages.map((image) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-2xl bg-surface-container-low"
            >
              <img
                alt="Selected upload preview"
                src={image.previewUrl}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeSelectedImage(image.id)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest/90 text-on-surface shadow-sm active:scale-95"
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-between items-center pt-2 border-t border-outline-variant/30 mt-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-tertiary rounded-full hover:bg-tertiary-fixed active:scale-95"
          >
            <ImageIcon size={20} /> Photo
          </button>
          <PrivacyDropdown
            value={postPrivacy}
            onChange={(val) => setPostPrivacy(val)}
          />
        </div>
        <button
          type="submit"
          disabled={
            isSubmitting ||
            (!content.trim() && selectedImages.length === 0)
          }
          className="bg-primary-container text-on-primary-container px-8 py-2 rounded-full text-sm font-bold active:scale-95 transition-transform shadow-sm disabled:opacity-60"
        >
          {isSubmitting
            ? selectedImages.length > 0
              ? "Uploading..."
              : "Posting..."
            : "Post"}
        </button>
      </div>

      <ConfirmDialog
        isOpen={showCreateConfirm}
        title="Create Post"
        message="Are you sure you want to create this post?"
        confirmLabel="Create"
        type="info"
        onConfirm={handleConfirmCreate}
        onCancel={() => setShowCreateConfirm(false)}
      />
    </form>
  );
}
