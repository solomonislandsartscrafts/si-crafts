'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { AccountRole, AccountUser } from '@/types';

const FIELD_CLASS =
  'w-full px-sm py-xs rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent';

const ROLE_OPTIONS = [
  { value: 'user', label: 'No role — sign-in only' },
  { value: 'stockist', label: 'Stockist — wholesale pricing and ordering' },
  { value: 'editor', label: 'Editor — manage content' },
  { value: 'super_admin', label: 'Super Admin — manage content and accounts' },
];

const ROLE_HELP: Record<AccountRole, string> = {
  user: 'They can sign in but see nothing extra. Useful before you decide on a role.',
  stockist: 'They get wholesale pricing and can place order requests.',
  editor: 'They can manage catalogue and site content, but not accounts.',
  super_admin: 'Full access, including adding and removing other accounts.',
};

interface UserFormModalProps {
  /** Omit to create a new account. */
  user?: AccountUser | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

/**
 * Create or edit any account, in one form.
 *
 * Choosing the Stockist role reveals the business details the wholesale side
 * needs, so an admin can add a shop they already deal with without waiting for
 * them to fill in the public application.
 */
export function UserFormModal({ user = null, onClose, onSuccess }: UserFormModalProps) {
  const isEdit = user !== null;

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [role, setRole] = useState<AccountRole>(user?.role ?? 'user');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(user?.isActive ?? true);

  const [businessName, setBusinessName] = useState(user?.stockist?.businessName ?? '');
  const [contactName, setContactName] = useState(user?.stockist?.contactName ?? '');
  const [abn, setAbn] = useState(user?.stockist?.abn ?? '');
  const [phone, setPhone] = useState(user?.stockist?.phone ?? '');
  const [description, setDescription] = useState(user?.stockist?.description ?? '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  const roleLocked = isEdit && user!.isSuperuser;

  // Focus the dialog on mount, close on Escape, keep Tab inside it.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (!saving) onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = dialog!.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [saving, onClose]);

  const isAdminRole = role === 'super_admin' || role === 'editor';
  const needsPassword = !isEdit && isAdminRole;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (needsPassword && !password.trim()) {
      setError('Admins need a password of at least 8 characters.');
      return;
    }
    if (password && password.length < 8) {
      setError('Password must be at least 8 characters, or leave it blank.');
      return;
    }
    if (role === 'stockist' && !businessName.trim()) {
      setError('Business name is required for a stockist.');
      return;
    }

    setSaving(true);
    setError('');

    const stockist =
      role === 'stockist'
        ? {
            businessName: businessName.trim(),
            contactName: contactName.trim() || name.trim(),
            abn: abn.trim(),
            phone: phone.trim(),
            description: description.trim(),
          }
        : undefined;

    try {
      const token = localStorage.getItem('admin_session');
      const res = await fetch('/api/users', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...(isEdit ? { id: user!.id } : {}),
          name: name.trim(),
          email: email.trim(),
          role,
          ...(password ? { password } : {}),
          ...(isEdit ? { isActive } : {}),
          ...(stockist ? { stockist } : {}),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to save the account.');

      onSuccess(data.message || 'Saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save the account.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-sm bg-deep-blue/50 overflow-y-auto"
      onClick={() => { if (!saving) onClose(); }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="bg-white rounded-lg shadow-md w-full max-w-lg my-lg outline-none"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-form-title"
      >
        <div className="flex items-center justify-between px-md py-sm border-b border-sand">
          <h2 id="user-form-title" className="font-heading text-xl font-medium text-deep-blue">
            {isEdit ? 'Edit Account' : 'Add Account'}
          </h2>
          <button
            onClick={() => { if (!saving) onClose(); }}
            disabled={saving}
            className="tap-target p-2xs text-warm-gray-400 hover:text-warm-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-md py-sm space-y-sm">
          {error && (
            <div
              className="bg-error/10 border border-error/20 text-error text-sm rounded-md p-xs"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="user-name" className="block text-sm font-medium text-warm-gray-800 mb-3xs">
              Full Name
            </label>
            <input
              id="user-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label htmlFor="user-email" className="block text-sm font-medium text-warm-gray-800 mb-3xs">
              Email *
            </label>
            <input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={FIELD_CLASS}
            />
            <p className="text-xs text-warm-gray-400 mt-3xs">This is the address they log in with.</p>
          </div>

          <div>
            <label htmlFor="user-role" className="block text-sm font-medium text-warm-gray-800 mb-3xs">
              Role *
            </label>
            {roleLocked ? (
              <p className="text-sm text-warm-gray-600 bg-sand-light rounded-md px-sm py-xs">
                Super Admin — this is the site owner account and its role can&apos;t be changed here.
              </p>
            ) : (
              <>
                <Select
                  id="user-role"
                  value={role}
                  onChange={(val) => setRole((val || 'user') as AccountRole)}
                  options={ROLE_OPTIONS}
                  placeholder="Select role"
                  label="Account role"
                  className="w-full"
                />
                <p className="text-xs text-warm-gray-400 mt-3xs">{ROLE_HELP[role]}</p>
              </>
            )}
          </div>

          {role === 'stockist' && (
            <fieldset className="border border-sand rounded-md p-sm space-y-sm">
              <legend className="text-sm font-semibold text-deep-blue px-3xs">
                Stockist details
              </legend>
              <p className="text-sm text-warm-gray-600">
                Fill these in yourself for a shop you already deal with — they don&apos;t
                need to submit the public application.
              </p>

              <div>
                <label htmlFor="user-business" className="block text-sm font-medium text-warm-gray-800 mb-3xs">
                  Business Name *
                </label>
                <input
                  id="user-business"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className={FIELD_CLASS}
                />
              </div>

              <div>
                <label htmlFor="user-contact" className="block text-sm font-medium text-warm-gray-800 mb-3xs">
                  Contact Name
                </label>
                <input
                  id="user-contact"
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Defaults to the full name above"
                  className={FIELD_CLASS}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                <div>
                  <label htmlFor="user-phone" className="block text-sm font-medium text-warm-gray-800 mb-3xs">
                    Phone
                  </label>
                  <input
                    id="user-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={FIELD_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor="user-abn" className="block text-sm font-medium text-warm-gray-800 mb-3xs">
                    ABN
                  </label>
                  <input
                    id="user-abn"
                    type="text"
                    inputMode="numeric"
                    maxLength={11}
                    value={abn}
                    onChange={(e) => setAbn(e.target.value)}
                    className={FIELD_CLASS}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="user-notes" className="block text-sm font-medium text-warm-gray-800 mb-3xs">
                  Notes
                </label>
                <textarea
                  id="user-notes"
                  rows={3}
                  maxLength={500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={FIELD_CLASS}
                />
              </div>
            </fieldset>
          )}

          <div>
            <label htmlFor="user-password" className="block text-sm font-medium text-warm-gray-800 mb-3xs">
              Password {needsPassword ? '*' : ''}
            </label>
            <input
              id="user-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEdit ? 'Leave blank to keep the current password' : 'Minimum 8 characters'}
              className={FIELD_CLASS}
            />
            <p className="text-xs text-warm-gray-400 mt-3xs">
              {isEdit
                ? 'Setting a password here replaces theirs immediately.'
                : role === 'stockist'
                  ? 'Leave blank and we\u2019ll email them a one-time link to choose their own.'
                  : 'Admins need a password set here.'}
            </p>
          </div>

          {isEdit && !user!.isSuperuser && (
            <label className="flex items-start gap-xs text-sm text-warm-gray-800">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mt-3xs w-4 h-4 rounded border-sand-dark text-ocean focus:ring-2 focus:ring-ocean"
              />
              <span>
                Account active
                <span className="block text-xs text-warm-gray-400">
                  Unchecking blocks sign-in without deleting anything.
                </span>
              </span>
            </label>
          )}

          <div className="flex items-center justify-end gap-xs pt-sm border-t border-sand">
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} loadingText="Saving...">
              {isEdit ? 'Save Changes' : 'Add Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
