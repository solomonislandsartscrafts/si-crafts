'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ClipboardList, MessageSquare, LogOut, ShoppingCart, Save, Upload, Lock } from 'lucide-react';
import { validateStockistSession } from '@/lib/auth-client';
import { getCart } from '@/lib/cart';
import { compressImage } from '@/lib/compress-image';
import { pageTitleClasses } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { FormField, inputClasses } from '@/components/ui/form-field';
import { SkeletonText } from '@/components/ui/skeleton';

interface StockistProfile {
  id: number;
  businessName: string;
  abn: string;
  contactName: string;
  email: string;
  phone: string;
  description: string;
  profileImageUrl: string;
}

export default function StockistAccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StockistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // Edit state
  const [editForm, setEditForm] = useState<Partial<StockistProfile>>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Image upload
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('stockist_session');
      if (!token) { router.push('/stockist/login'); return; }

      const s = await validateStockistSession(token);
      if (!s) { localStorage.removeItem('stockist_session'); router.push('/stockist/login'); return; }

      // Load full profile from backend
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      try {
        const res = await fetch(`${API_URL}/api/stockists/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setEditForm(data);
        }
      } catch {
        // Fall back to basic session data
      }

      setCartCount(getCart().reduce((sum, i) => sum + i.quantity, 0));
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    try {
      const token = localStorage.getItem('stockist_session');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/stockists/profile/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save.');
      }

      const updated = await res.json();
      setProfile(updated);
      setEditForm(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      const token = localStorage.getItem('stockist_session');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/stockists/change-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password.');
      }

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    setUploading(true);
    try {
      const compressed = await compressImage(file, 400, 0.8);
      const formData = new FormData();
      formData.append('file', compressed, `profile-${Date.now()}.webp`);

      const token = localStorage.getItem('stockist_session') ?? '';
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const uploadRes = await fetch(`${API_URL}/api/upload/`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Upload failed');
      const { url } = await uploadRes.json();

      // Save to profile
      const profileRes = await fetch(`${API_URL}/api/stockists/profile/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profileImageUrl: url }),
      });

      if (profileRes.ok) {
        const updated = await profileRes.json();
        setProfile(updated);
        setEditForm(updated);
      }
    } catch {
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleLogout() {
    const token = localStorage.getItem('stockist_session');
    if (token) {
      await fetch('/api/auth/stockist/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
    }
    localStorage.removeItem('stockist_session');
    router.push('/');
  }

  if (loading) {
    return (
      <div className="site-container page-y">
        <SkeletonText lines={4} />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="site-container page-y">
      {/* Welcome + Logout */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          {/* Profile image */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-sand-light border border-sand shrink-0">
            {profile.profileImageUrl ? (
              <Image src={profile.profileImageUrl} alt={profile.contactName} fill className="object-cover" sizes="64px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-warm-gray-400 text-xl font-bold">
                {profile.contactName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className={pageTitleClasses}>
              Welcome back, {profile.contactName.split(' ')[0]}
            </h1>
            <p className="text-warm-gray-600 mt-1">{profile.businessName}</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          Log out
        </Button>
      </div>

      {/* Quick actions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <Link href="/stockist/catalogue" className="group block p-6 bg-white rounded-lg shadow-card hover:shadow-md transition-shadow">
          <Package className="w-6 h-6 text-ocean mb-3" />
          <h3 className="font-heading font-semibold text-deep-blue group-hover:text-ocean transition-colors">Browse Catalogue</h3>
          <p className="text-base text-warm-gray-600 mt-1">View products and pricing</p>
        </Link>

        <Link href="/stockist/orders" className="group block p-6 bg-white rounded-lg shadow-card hover:shadow-md transition-shadow relative">
          <ShoppingCart className="w-6 h-6 text-ocean mb-3" />
          <h3 className="font-heading font-semibold text-deep-blue group-hover:text-ocean transition-colors">Current Order</h3>
          <p className="text-base text-warm-gray-600 mt-1">
            {cartCount > 0 ? `${cartCount} item${cartCount > 1 ? 's' : ''} in order` : 'Start an order'}
          </p>
          {cartCount > 0 && (
            <span className="absolute top-4 right-4 min-w-[20px] h-[20px] flex items-center justify-center bg-brand-green text-white text-xs font-bold rounded-full px-1">
              {cartCount}
            </span>
          )}
        </Link>

        <Link href="/stockist/order-history" className="group block p-6 bg-white rounded-lg shadow-card hover:shadow-md transition-shadow">
          <ClipboardList className="w-6 h-6 text-ocean mb-3" />
          <h3 className="font-heading font-semibold text-deep-blue group-hover:text-ocean transition-colors">Order History</h3>
          <p className="text-base text-warm-gray-600 mt-1">View past orders and status</p>
        </Link>

        <Link href="/stockist/requests" className="group block p-6 bg-white rounded-lg shadow-card hover:shadow-md transition-shadow">
          <MessageSquare className="w-6 h-6 text-ocean mb-3" />
          <h3 className="font-heading font-semibold text-deep-blue group-hover:text-ocean transition-colors">Requests</h3>
          <p className="text-base text-warm-gray-600 mt-1">Custom orders and tags</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Details (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Edit Profile Form */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="font-heading text-lg font-medium text-deep-blue mb-4">Profile Details</h2>

            {saveSuccess && (
              <div className="mb-4 bg-success/10 border border-success/20 text-success text-base rounded-md p-3" role="status">
                Profile updated successfully.
              </div>
            )}
            {saveError && (
              <div className="mb-4 bg-error/10 border border-error/20 text-error text-base rounded-md p-3" role="alert">
                {saveError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Contact Name" htmlFor="contactName">
                  <input
                    id="contactName"
                    type="text"
                    value={editForm.contactName ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })}
                    className={inputClasses}
                  />
                </FormField>
                <FormField label="Business Name" htmlFor="businessName">
                  <input
                    id="businessName"
                    type="text"
                    value={editForm.businessName ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                    className={inputClasses}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Phone" htmlFor="phone">
                  <input
                    id="phone"
                    type="tel"
                    value={editForm.phone ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className={inputClasses}
                  />
                </FormField>
                <FormField label="ABN" htmlFor="abn">
                  <input
                    id="abn"
                    type="text"
                    value={editForm.abn ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, abn: e.target.value })}
                    className={inputClasses}
                  />
                </FormField>
              </div>

              <div>
                <FormField label="Email" htmlFor="email">
                  <input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className={inputClasses}
                  />
                </FormField>
                <p className="text-xs text-warm-gray-400 mt-1">Email cannot be changed. Contact us if needed.</p>
              </div>

              <Button type="submit" size="sm" loading={saving} loadingText="Saving...">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="font-heading text-lg font-medium text-deep-blue mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-ocean" />
              Change Password
            </h2>

            {passwordSuccess && (
              <div className="mb-4 bg-success/10 border border-success/20 text-success text-base rounded-md p-3" role="status">
                Password changed successfully.
              </div>
            )}
            {passwordError && (
              <div className="mb-4 bg-error/10 border border-error/20 text-error text-base rounded-md p-3" role="alert">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <FormField label="Current Password" htmlFor="currentPassword">
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClasses}
                />
              </FormField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="New Password" htmlFor="newPassword">
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className={inputClasses}
                  />
                </FormField>
                <FormField label="Confirm New Password" htmlFor="confirmNewPassword">
                  <input
                    id="confirmNewPassword"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className={inputClasses}
                  />
                </FormField>
              </div>

              <Button
                type="submit"
                variant="secondary"
                size="sm"
                loading={passwordSaving}
                loadingText="Updating..."
              >
                <Lock className="w-4 h-4" />
                Update Password
              </Button>
            </form>
          </div>
        </div>

        {/* Profile Image (1 col) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="font-heading text-lg font-medium text-deep-blue mb-4">Profile Photo</h2>

            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-sand-light border-2 border-sand mb-4">
                {profile.profileImageUrl ? (
                  <Image src={profile.profileImageUrl} alt={profile.contactName} fill className="object-cover" sizes="128px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-warm-gray-400 text-3xl font-bold">
                    {profile.contactName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                loading={uploading}
                loadingText="Uploading..."
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                className="hidden"
                aria-label="Upload profile photo"
              />

              <p className="text-xs text-warm-gray-400 mt-3 text-center">
                Square photo recommended. Max 10 MB.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
