import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';

import {
  Edit3,
  IdCard,
  Mail,
  Save,
  Shield,
  User,
  X,
} from 'lucide-react';

import userLogo from '../assets/user-Logo.jpg';

import {
  getCurrentHr,
} from '../services/authService';

import {
  updateEmployee,
} from '../services/employeeService';

interface ProfileForm {
  name: string;
  surname: string;
  emailAddress: string;
  role: string;
  password: string;
  confirmPassword: string;
}

export function UserProfilePage() {
  const currentHr = getCurrentHr();

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const [form, setForm] =
    useState<ProfileForm>({
      name: currentHr?.name ?? '',
      surname: currentHr?.surname ?? '',
      emailAddress:
        currentHr?.emailAddress ?? '',
      role: currentHr?.role ?? 'HR',
      password: '',
      confirmPassword: '',
    });

  if (!currentHr) {
    return (
      <div className="max-w-3xl">
        <p className="auth-error">
          HR profile information is unavailable.
          Please sign in again.
        </p>
      </div>
    );
  }

  const hr = currentHr;

  const fullName =
    `${form.name} ${form.surname}`.trim();

  function handleChange(
    event:
      ChangeEvent<HTMLInputElement |
        HTMLSelectElement>,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function startEditing() {
    setError('');
    setSuccess('');
    setEditing(true);
  }

  function cancelEditing() {
    setForm({
      name: hr.name,
      surname: hr.surname,
      emailAddress: hr.emailAddress,
      role: hr.role,
      password: '',
      confirmPassword: '',
    });

    setError('');
    setSuccess('');
    setEditing(false);
  }

  async function handleSave(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (
      form.password &&
      form.password.length < 8
    ) {
      setError(
        'The new password must contain at least 8 characters.',
      );
      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        'Password and confirmation password do not match.',
      );
      return;
    }

    setSaving(true);

    try {
      const response =
        await updateEmployee(
          hr.employeeId,
          {
            name: form.name.trim(),
            surname:
              form.surname.trim(),
            emailAddress:
              form.emailAddress
                .trim()
                .toLowerCase(),
            role: form.role,
            password:
              form.password.trim() ||
              null,
          },
        );

      const updatedEmployee =
        response.employee;

      sessionStorage.setItem(
        'employee',
        JSON.stringify(
          updatedEmployee,
        ),
      );

      setForm({
        name: updatedEmployee.name,
        surname:
          updatedEmployee.surname,
        emailAddress:
          updatedEmployee.emailAddress,
        role: updatedEmployee.role,
        password: '',
        confirmPassword: '',
      });

      setSuccess(
        response.message ||
          'Profile updated successfully.',
      );

      setEditing(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to update the profile.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Profile settings
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          View and update your personal details
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8"
      >
        {error && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
            {success}
          </div>
        )}

        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md">
            <img
              src={userLogo}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
              {fullName}
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {form.role}
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <ProfileField
            label="Name"
            icon={User}
          >
            {editing ? (
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="profile-input"
              />
            ) : (
              form.name
            )}
          </ProfileField>

          <ProfileField
            label="Surname"
            icon={User}
          >
            {editing ? (
              <input
                name="surname"
                value={form.surname}
                onChange={handleChange}
                required
                className="profile-input"
              />
            ) : (
              form.surname
            )}
          </ProfileField>

          <ProfileField
            label="Employee ID"
            icon={IdCard}
          >
            {currentHr.employeeId}
          </ProfileField>

          <ProfileField
            label="Role"
            icon={Shield}
          >
            {editing ? (
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="profile-input"
              >
                <option value="HR">
                  HR
                </option>

                <option value="Employee">
                  Employee
                </option>
              </select>
            ) : (
              form.role
            )}
          </ProfileField>

          <ProfileField
            label="Email Address"
            icon={Mail}
          >
            {editing ? (
              <input
                name="emailAddress"
                type="email"
                value={form.emailAddress}
                onChange={handleChange}
                required
                className="profile-input"
              />
            ) : (
              form.emailAddress
            )}
          </ProfileField>

          {editing && (
            <>
              <ProfileField
                label="New Password"
                icon={Shield}
              >
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={8}
                  placeholder="Leave blank to keep current password"
                  className="profile-input"
                />
              </ProfileField>

              <ProfileField
                label="Confirm New Password"
                icon={Shield}
              >
                <input
                  name="confirmPassword"
                  type="password"
                  value={
                    form.confirmPassword
                  }
                  onChange={handleChange}
                  className="profile-input"
                />
              </ProfileField>
            </>
          )}
        </div>

        <div className="flex gap-3">
          {editing ? (
            <>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="flex items-center justify-center gap-2 flex-1 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 flex-1 py-3 bg-brand-blue hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl shadow-md"
              >
                <Save className="w-4 h-4" />

                {saving
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={startEditing}
              className="flex items-center justify-center gap-2 w-full py-3 bg-brand-blue hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

interface ProfileFieldProps {
  label: string;
  icon: typeof User;
  children: React.ReactNode;
}

function ProfileField({
  label,
  icon: FieldIcon,
  children,
}: ProfileFieldProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
      <FieldIcon className="w-5 h-5 text-slate-400 shrink-0" />

      <div className="flex-1">
        <p className="text-xs text-slate-400">
          {label}
        </p>

        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
}