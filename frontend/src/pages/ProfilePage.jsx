import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi, userApi } from '../services/api';
import Modal from '../components/Modal';
import {
  User as UserIcon,
  Mail,
  Lock,
  KeyRound,
  Trash2,
  LogOut,
  ShieldCheck,
  Check,
  Save,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Name update state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [updatingName, setUpdatingName] = useState(false);

  // Password update state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Account deletion modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      toast.error('Full name must have at least 2 characters.');
      return;
    }
    setUpdatingName(true);
    try {
      const updated = await userApi.updateProfile({ full_name: fullName.trim() });
      updateUser(updated);
      toast.success('Display name updated successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to update name.');
    } finally {
      setUpdatingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please provide your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
      toast.error(err.message || 'Password update failed.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await userApi.deleteAccount();
      toast.success('Your account and all associated scans have been permanently deleted.');
      navigate('/');
    } catch (err) {
      toast.error('Failed to delete account.');
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Account & Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your personal details, credentials, and data retention.
        </p>
      </div>

      {/* Account Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-teal-400" />
          <span>Profile Information</span>
        </h2>

        <form onSubmit={handleUpdateName} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300" htmlFor="prof-name">
                Full Display Name
              </label>
              <input
                id="prof-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl text-sm text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300" htmlFor="prof-email">
                Registered Email Address
              </label>
              <input
                id="prof-email"
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-400 outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-[11px] text-slate-500 font-mono">
              Role: <span className="text-teal-400 uppercase">{user?.role}</span>
            </span>
            <button
              type="submit"
              disabled={updatingName}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
            >
              {updatingName ? (
                <span className="w-3.5 h-3.5 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-teal-400" />
          <span>Change Password</span>
        </h2>

        {passwordError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {passwordError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300" htmlFor="curr-pass">
              Current Password
            </label>
            <input
              id="curr-pass"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl text-sm text-slate-100 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300" htmlFor="new-pass">
                New Password (min 8 chars)
              </label>
              <input
                id="new-pass"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl text-sm text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300" htmlFor="confirm-pass">
                Confirm New Password
              </label>
              <input
                id="confirm-pass"
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl text-sm text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {changingPassword ? (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <KeyRound className="w-3.5 h-3.5" />
              )}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="p-6 sm:p-8 rounded-3xl bg-rose-950/20 border border-rose-900/40 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-rose-300 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span>Danger Zone: Account Deletion</span>
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Permanently delete your account and all associated scan history. This action purges all data from the database and cannot be recovered.
        </p>
        <div className="pt-2">
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete My Account</span>
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Permanently Delete Account?"
        description="Are you completely sure you want to delete your account? All of your saved scans, risk assessments, and account credentials will be immediately purged. This cannot be undone."
        confirmText="Yes, Permanently Delete"
        isDanger={true}
        isLoading={isDeletingAccount}
      />
    </div>
  );
}
