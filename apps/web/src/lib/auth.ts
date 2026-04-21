export const AUTH_COOKIE_NAMES = {
  access: 'uytop_access_token',
  refresh: 'uytop_refresh_token',
  user: 'uytop_auth_user',
} as const;

export const AUTH_COOKIE_MAX_AGE = {
  access: 60 * 60 * 24,
  refresh: 60 * 60 * 24 * 7,
  user: 60 * 60 * 24 * 7,
} as const;

export type AuthenticatedUserProfile = {
  preferred_language: string;
  city: string;
  district: string;
};

export type AuthenticatedOwnerVerification = {
  status: string;
  notes: string;
  reviewed_at: string | null;
};

export type AuthenticatedUser = {
  id: number;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_verified_owner: boolean;
  profile?: AuthenticatedUserProfile;
  owner_verification?: AuthenticatedOwnerVerification | null;
};

export type AuthResponse = {
  access: string;
  refresh: string;
  user: AuthenticatedUser;
};

export type AuthActionSuccessResponse = {
  ok: true;
  user: AuthenticatedUser;
};

export type AuthActionErrorResponse = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

type ErrorPayload = Record<string, unknown>;

function pickString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === 'string' && item.trim());
    return typeof first === 'string' ? first : undefined;
  }

  return undefined;
}

export function getAuthDisplayName(user: Pick<AuthenticatedUser, 'full_name' | 'first_name' | 'email'> | null | undefined) {
  if (!user) {
    return '';
  }

  if (user.full_name?.trim()) {
    return user.full_name.trim();
  }

  if (user.first_name?.trim()) {
    return user.first_name.trim();
  }

  return user.email;
}

export function normalizeFieldErrors(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  const errors: Record<string, string> = {};

  for (const [field, value] of Object.entries(payload as ErrorPayload)) {
    if (field === 'detail' || field === 'error' || field === 'non_field_errors') {
      continue;
    }

    const message = pickString(value);
    if (message) {
      errors[field] = message;
    }
  }

  return errors;
}

export function extractErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const record = payload as ErrorPayload;

  return (
    pickString(record.detail) ??
    pickString(record.error) ??
    pickString(record.identifier) ??
    pickString(record.non_field_errors) ??
    Object.values(normalizeFieldErrors(payload))[0] ??
    fallback
  );
}
