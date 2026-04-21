export const SUPPORTED_LOCALES = ['uz', 'en', 'ru'] as const;
export type LocaleCode = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: LocaleCode = 'uz';
export const LOCALE_COOKIE_NAME = 'uytop_locale';
export const LOCALE_HEADER = 'X-UyTop-Locale';

export function isSupportedLocale(value?: string | null): value is LocaleCode {
  return Boolean(value && SUPPORTED_LOCALES.includes(value as LocaleCode));
}

export function normalizeLocale(value?: string | null): LocaleCode {
  if (!value) {
    return DEFAULT_LOCALE;
  }

  const normalized = value.trim().toLowerCase().replace('_', '-');
  if (SUPPORTED_LOCALES.includes(normalized as LocaleCode)) {
    return normalized as LocaleCode;
  }

  const short = normalized.split('-', 1)[0];
  return SUPPORTED_LOCALES.includes(short as LocaleCode) ? (short as LocaleCode) : DEFAULT_LOCALE;
}

export function getPathLocale(pathname?: string | null): LocaleCode | null {
  if (!pathname) {
    return null;
  }

  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return isSupportedLocale(firstSegment) ? firstSegment : null;
}

export function stripLocaleFromPath(pathname: string) {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const locale = getPathLocale(normalizedPath);

  if (!locale) {
    return normalizedPath || '/';
  }

  const segments = normalizedPath.split('/').filter(Boolean).slice(1);
  return segments.length ? `/${segments.join('/')}` : '/';
}

export function buildLocalizedPath(locale: LocaleCode, pathname = '/') {
  const strippedPath = stripLocaleFromPath(pathname);
  return strippedPath === '/' ? `/${locale}` : `/${locale}${strippedPath}`;
}

export function replaceLocaleInPath(pathname: string, locale: LocaleCode) {
  return buildLocalizedPath(locale, pathname);
}

export async function getServerLocale(): Promise<LocaleCode> {
  const { cookies, headers } = await import('next/headers');
  const headerStore = await headers();
  const headerLocale = headerStore.get(LOCALE_HEADER);

  if (headerLocale) {
    return normalizeLocale(headerLocale);
  }

  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}

export const localeLabels: Record<LocaleCode, string> = {
  uz: "O'zbekcha",
  en: 'English',
  ru: 'Русский',
};

type AuthHighlight = {
  title: string;
  body: string;
};

type WebDictionary = {
  brandLine: string;
  nav: {
    map: string;
    projects: string;
    developers: string;
    residences: string;
    cta: string;
    language: string;
    login: string;
    register: string;
    logout: string;
    account: string;
    signingOut: string;
  };
};

export const webDictionary: Record<
  LocaleCode,
  WebDictionary
> = {
  uz: {
    brandLine: 'Tasavvur va yashash birlashadigan joy',
    nav: {
      map: 'Jonli xarita',
      projects: 'Loyihalar',
      developers: 'Quruvchilar',
      residences: 'Uylar',
      cta: 'Loyihalarni ko‘rish',
      language: 'Til',
      login: 'Kirish',
      register: 'Ro‘yxatdan o‘tish',
      logout: 'Chiqish',
      account: 'Hisob',
      signingOut: 'Chiqilmoqda...',
    },
  },
  en: {
    brandLine: 'Where vision meets residence',
    nav: {
      map: 'Live map',
      projects: 'Projects',
      developers: 'Developers',
      residences: 'Residences',
      cta: 'Explore launches',
      language: 'Language',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      account: 'Account',
      signingOut: 'Signing out...',
    },
  },
  ru: {
    brandLine: 'Где замысел встречается с жильём',
    nav: {
      map: 'Живая карта',
      projects: 'Проекты',
      developers: 'Застройщики',
      residences: 'Жильё',
      cta: 'Смотреть проекты',
      language: 'Язык',
      login: 'Войти',
      register: 'Регистрация',
      logout: 'Выйти',
      account: 'Аккаунт',
      signingOut: 'Выход...',
    },
  },
};

export const authDictionary: Record<
  LocaleCode,
  {
    shared: {
      panelEyebrow: string;
      panelTitle: string;
      panelBody: string;
      highlights: AuthHighlight[];
    };
    login: {
      pageEyebrow: string;
      title: string;
      body: string;
      identifierLabel: string;
      identifierPlaceholder: string;
      passwordLabel: string;
      passwordPlaceholder: string;
      submit: string;
      submitting: string;
      alternatePrompt: string;
      alternateCta: string;
    };
    register: {
      pageEyebrow: string;
      title: string;
      body: string;
      firstNameLabel: string;
      firstNamePlaceholder: string;
      lastNameLabel: string;
      lastNamePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      phoneLabel: string;
      phonePlaceholder: string;
      passwordLabel: string;
      passwordPlaceholder: string;
      submit: string;
      submitting: string;
      alternatePrompt: string;
      alternateCta: string;
    };
    validation: {
      required: string;
      invalidEmail: string;
      passwordTooShort: string;
    };
    messages: {
      authUnavailable: string;
      logoutFailed: string;
    };
  }
> = {
  uz: {
    shared: {
      panelEyebrow: 'UyTop hisobi',
      panelTitle: 'Xarita, loyihalar va uylar uchun bitta kirish nuqtasi.',
      panelBody:
        'Public web uchun birinchi haqiqiy foydalanuvchi oqimi endi backenddagi mavjud auth kontrakti bilan ishlaydi.',
      highlights: [
        {
          title: 'Email yoki telefon orqali kirish',
          body: 'Bir xil backend foydalanuvchi hisobi bilan public webga tez kirish mumkin.',
        },
        {
          title: 'Uch tilda ishlash',
          body: 'Kirish va ro‘yxatdan o‘tish oqimi Uzbek, English va Russian yo‘nalishlariga moslashtiriladi.',
        },
        {
          title: 'Keyingi buyer vositalari uchun tayyor',
          body: 'Sessiya asosi kelajakdagi saqlangan va shaxsiy funksiyalarni qo‘shish uchun tayyorlanadi.',
        },
      ],
    },
    login: {
      pageEyebrow: 'Kirish',
      title: 'Buyer hisobingizga kiring.',
      body: 'Email yoki telefon raqami orqali kirib, UyTop public web tajribasini davom ettiring.',
      identifierLabel: 'Email yoki telefon',
      identifierPlaceholder: 'name@example.com yoki +998 90 123 45 67',
      passwordLabel: 'Parol',
      passwordPlaceholder: 'Parolingizni kiriting',
      submit: 'Kirish',
      submitting: 'Kirilmoqda...',
      alternatePrompt: 'Hali hisob yo‘qmi?',
      alternateCta: 'Ro‘yxatdan o‘tish',
    },
    register: {
      pageEyebrow: 'Ro‘yxatdan o‘tish',
      title: 'Buyer hisobini bir necha daqiqada yarating.',
      body: 'Birlamchi public auth bosqichida buyer hisoblari yaratiladi va foydalanuvchi darhol tizimga kiradi.',
      firstNameLabel: 'Ism',
      firstNamePlaceholder: 'Ismingiz',
      lastNameLabel: 'Familiya',
      lastNamePlaceholder: 'Familiyangiz',
      emailLabel: 'Email',
      emailPlaceholder: 'name@example.com',
      phoneLabel: 'Telefon raqami',
      phonePlaceholder: '+998 90 123 45 67',
      passwordLabel: 'Parol',
      passwordPlaceholder: 'Kamida 8 ta belgi',
      submit: 'Hisob yaratish',
      submitting: 'Hisob yaratilmoqda...',
      alternatePrompt: 'Allaqachon hisob bormi?',
      alternateCta: 'Kirish',
    },
    validation: {
      required: 'Bu maydon majburiy.',
      invalidEmail: 'To‘g‘ri email manzilini kiriting.',
      passwordTooShort: 'Parol kamida 8 ta belgidan iborat bo‘lishi kerak.',
    },
    messages: {
      authUnavailable: 'Auth xizmati hozircha mavjud emas.',
      logoutFailed: 'Hisobdan chiqib bo‘lmadi.',
    },
  },
  en: {
    shared: {
      panelEyebrow: 'UyTop account',
      panelTitle: 'One account layer for map, projects, and residences.',
      panelBody:
        'The first real public auth flow now uses the existing backend contract and keeps the session inside the web app.',
      highlights: [
        {
          title: 'Email or phone sign-in',
          body: 'Use the same backend-backed identity across the public web experience.',
        },
        {
          title: 'Localized flow',
          body: 'The entry flow is available within the Uzbek, English, and Russian web surfaces.',
        },
        {
          title: 'Ready for buyer tools',
          body: 'This session baseline prepares the app for future saved and personalized features.',
        },
      ],
    },
    login: {
      pageEyebrow: 'Login',
      title: 'Sign in to your buyer account.',
      body: 'Use your email or phone to continue through the UyTop public web experience.',
      identifierLabel: 'Email or phone',
      identifierPlaceholder: 'name@example.com or +998 90 123 45 67',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      submit: 'Sign in',
      submitting: 'Signing in...',
      alternatePrompt: "Don't have an account yet?",
      alternateCta: 'Create one',
    },
    register: {
      pageEyebrow: 'Register',
      title: 'Create a buyer account in minutes.',
      body: 'The first public auth release focuses on buyer accounts and signs the user in immediately after registration.',
      firstNameLabel: 'First name',
      firstNamePlaceholder: 'Your first name',
      lastNameLabel: 'Last name',
      lastNamePlaceholder: 'Your last name',
      emailLabel: 'Email',
      emailPlaceholder: 'name@example.com',
      phoneLabel: 'Phone number',
      phonePlaceholder: '+998 90 123 45 67',
      passwordLabel: 'Password',
      passwordPlaceholder: 'At least 8 characters',
      submit: 'Create account',
      submitting: 'Creating account...',
      alternatePrompt: 'Already have an account?',
      alternateCta: 'Sign in',
    },
    validation: {
      required: 'This field is required.',
      invalidEmail: 'Enter a valid email address.',
      passwordTooShort: 'Password must be at least 8 characters.',
    },
    messages: {
      authUnavailable: 'The authentication service is unavailable right now.',
      logoutFailed: 'Failed to sign out.',
    },
  },
  ru: {
    shared: {
      panelEyebrow: 'Аккаунт UyTop',
      panelTitle: 'Единый вход для карты, проектов и квартир.',
      panelBody:
        'Первый полноценный public auth поток использует уже существующий backend-контракт и хранит сессию внутри web-приложения.',
      highlights: [
        {
          title: 'Вход по email или телефону',
          body: 'Один и тот же backend-аккаунт работает на всём публичном сайте.',
        },
        {
          title: 'Локализованный поток',
          body: 'Экран входа и регистрации встроен в Uzbek, English и Russian версии сайта.',
        },
        {
          title: 'Основа для buyer-инструментов',
          body: 'Сессионный слой готовит платформу к будущим персональным и сохранённым функциям.',
        },
      ],
    },
    login: {
      pageEyebrow: 'Вход',
      title: 'Войдите в свой buyer-аккаунт.',
      body: 'Используйте email или телефон, чтобы продолжить работу в публичной версии UyTop.',
      identifierLabel: 'Email или телефон',
      identifierPlaceholder: 'name@example.com или +998 90 123 45 67',
      passwordLabel: 'Пароль',
      passwordPlaceholder: 'Введите пароль',
      submit: 'Войти',
      submitting: 'Вход...',
      alternatePrompt: 'Ещё нет аккаунта?',
      alternateCta: 'Зарегистрироваться',
    },
    register: {
      pageEyebrow: 'Регистрация',
      title: 'Создайте buyer-аккаунт за несколько минут.',
      body: 'На первом этапе public auth создаются buyer-аккаунты, и пользователь сразу входит в систему.',
      firstNameLabel: 'Имя',
      firstNamePlaceholder: 'Ваше имя',
      lastNameLabel: 'Фамилия',
      lastNamePlaceholder: 'Ваша фамилия',
      emailLabel: 'Email',
      emailPlaceholder: 'name@example.com',
      phoneLabel: 'Телефон',
      phonePlaceholder: '+998 90 123 45 67',
      passwordLabel: 'Пароль',
      passwordPlaceholder: 'Минимум 8 символов',
      submit: 'Создать аккаунт',
      submitting: 'Создание аккаунта...',
      alternatePrompt: 'Уже есть аккаунт?',
      alternateCta: 'Войти',
    },
    validation: {
      required: 'Это поле обязательно.',
      invalidEmail: 'Введите корректный email.',
      passwordTooShort: 'Пароль должен содержать минимум 8 символов.',
    },
    messages: {
      authUnavailable: 'Сервис авторизации сейчас недоступен.',
      logoutFailed: 'Не удалось выйти из аккаунта.',
    },
  },
};
