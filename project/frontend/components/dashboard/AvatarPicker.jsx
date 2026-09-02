'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2, User as UserIcon, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/lib/api';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // matches backend/src/middleware/upload.js
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

/**
 * Profile-photo upload/remove control backed by `userApi.uploadAvatar` /
 * `userApi.deleteAvatar`. Shared by the onboarding wizard and the Profile
 * Settings page so there's a single implementation of the upload flow.
 */
export default function AvatarPicker({ size = 20 }) {
  const { user, updateUser } = useAuth();
  const inputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState('');

  const pickFile = () => inputRef.current?.click();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    setError('');
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setError('Please choose a JPG, PNG or WEBP image.');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError('Image is too large — please pick one under 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploading(true);
    try {
      const res = await userApi.uploadAvatar(formData);
      updateUser({ avatarUrl: res.data.user.avatarUrl });
    } catch (err) {
      setError(err.message || 'Could not upload that image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setError('');
    setIsRemoving(true);
    try {
      await userApi.deleteAvatar();
      updateUser({ avatarUrl: '' });
    } catch (err) {
      setError(err.message || 'Could not remove your photo. Please try again.');
    } finally {
      setIsRemoving(false);
    }
  };

  const busy = isUploading || isRemoving;
  const dimension = `${size / 4}rem`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ height: dimension, width: dimension }}>
        <div className="grid h-full w-full place-items-center overflow-hidden rounded-full border border-ink-100 bg-ink-50 text-ink-300">
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="Your profile" className="h-full w-full object-cover" />
          ) : (
            <UserIcon size={size * 1.5} />
          )}
          {isUploading && (
            <div className="absolute inset-0 grid place-items-center rounded-full bg-ink-900/40">
              <Loader2 size={20} className="animate-spin text-white" />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={pickFile}
          disabled={busy}
          aria-label="Upload profile picture"
          className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-brand-600 text-white shadow-soft transition-colors hover:bg-brand-700 disabled:bg-brand-300"
        >
          <Camera size={14} />
        </button>
        {user?.avatarUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={busy}
            aria-label="Remove profile picture"
            className="absolute -bottom-1 -left-1 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-ink-600 text-white shadow-soft transition-colors hover:bg-ink-700 disabled:bg-ink-300"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        onClick={pickFile}
        disabled={busy}
        className="mt-2.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
      >
        {user?.avatarUrl ? 'Change photo' : 'Add a profile photo'}
      </button>
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
