import Link from 'next/link';

import { DashboardHeader } from '@/components/layout/dashboard-header';
import { Card } from '@/components/ui/card';
import { classNames } from '@/lib/utils/classnames';
import type { LocaleCode } from '@/lib/i18n';
import type { AdminOnlineSession, AdminRegisteredUser, AdminUsersOverview } from '@/types/api';

import { UsersAutoRefresh } from './users-auto-refresh';

type UsersOverviewProps = {
  locale: LocaleCode;
  overview: AdminUsersOverview;
};

type MetricCard = {
  key: keyof AdminUsersOverview['metrics'];
  label: string;
  helper: string;
};

type UsersCopy = {
  eyebrow: string;
  title: string;
  description: string;
  refresh: string;
  refreshing: string;
  autoRefresh: string;
  updatedAt: string;
  onlineRule: (minutes: number) => string;
  metrics: MetricCard[];
  onlineSessionsEyebrow: string;
  onlineSessionsTitle: string;
  onlineSessionsCopy: string;
  registeredEyebrow: string;
  registeredTitle: string;
  registeredCopy: string;
  emptyOnline: string;
  emptyRegistered: string;
  sessionColumns: {
    identity: string;
    type: string;
    path: string;
    locale: string;
    lastSeen: string;
  };
  userColumns: {
    user: string;
    role: string;
    status: string;
    language: string;
    lastSeen: string;
    created: string;
    lastLogin: string;
  };
  guest: string;
  registered: string;
  online: string;
  offline: string;
  noLastSeen: string;
  noLogin: string;
  unknownPath: string;
  pageLabel: (page: number, totalPages: number) => string;
  previousPage: string;
  nextPage: string;
  visitorLabel: string;
};

const usersCopy: Record<LocaleCode, UsersCopy> = {
  uz: {
    eyebrow: 'Foydalanuvchilar',
    title: 'Jonli foydalanuvchi va mehmon oqimi',
    description:
      'Public web bo‘yicha online sessiyalar, anonim tashriflar va barcha ro‘yxatdan o‘tgan foydalanuvchilar bitta operatsion oynada ko‘rinadi.',
    refresh: 'Yangilash',
    refreshing: 'Yangilanmoqda...',
    autoRefresh: 'Har 15 soniyada avtomatik yangilanadi',
    updatedAt: 'So‘nggi yangilanish',
    onlineRule: (minutes) => `Online holat: oxirgi ${minutes} daqiqadagi faollik`,
    metrics: [
      { key: 'online_now', label: 'Hozir online', helper: 'Faol public web sessiyalari' },
      { key: 'registered_accounts', label: 'Ro‘yxatdan o‘tganlar', helper: 'Barcha tizim foydalanuvchilari' },
      { key: 'guest_sessions', label: 'Mehmon sessiyalari', helper: 'Hisobsiz kuzatilgan sessiyalar' },
      { key: 'total_observed_sessions', label: 'Jami sessiyalar', helper: 'Barcha kuzatilgan public web sessiyalari' },
    ],
    onlineSessionsEyebrow: 'Realtime',
    onlineSessionsTitle: 'Online sessiyalar',
    onlineSessionsCopy: 'Ro‘yxatdan o‘tgan foydalanuvchilar va anonim mehmonlar bir jadvalda ko‘rsatiladi.',
    registeredEyebrow: 'Accounts',
    registeredTitle: 'Barcha ro‘yxatdan o‘tgan foydalanuvchilar',
    registeredCopy: 'Har bir foydalanuvchi uchun rol, til, oxirgi faollik va ro‘yxatdan o‘tgan vaqt ko‘rsatiladi.',
    emptyOnline: 'Hozircha online public web sessiyalari yo‘q.',
    emptyRegistered: 'Ro‘yxatdan o‘tgan foydalanuvchilar topilmadi.',
    sessionColumns: {
      identity: 'Sessiya / foydalanuvchi',
      type: 'Turi',
      path: 'Sahifa',
      locale: 'Til',
      lastSeen: 'Oxirgi faollik',
    },
    userColumns: {
      user: 'Foydalanuvchi',
      role: 'Rol',
      status: 'Holat',
      language: 'Til',
      lastSeen: 'Oxirgi faollik',
      created: 'Ro‘yxatdan o‘tgan',
      lastLogin: 'Oxirgi login',
    },
    guest: 'Mehmon',
    registered: 'Ro‘yxatdan o‘tgan',
    online: 'Online',
    offline: 'Offline',
    noLastSeen: 'Faollik yo‘q',
    noLogin: 'Login yo‘q',
    unknownPath: 'Noma’lum sahifa',
    pageLabel: (page, totalPages) => `Sahifa ${page} / ${totalPages}`,
    previousPage: 'Oldingi',
    nextPage: 'Keyingi',
    visitorLabel: 'Tashrifchi',
  },
  en: {
    eyebrow: 'Users',
    title: 'Live users and guest traffic',
    description:
      'See public-web online sessions, anonymous visitors, and all registered accounts inside one operational workspace.',
    refresh: 'Refresh',
    refreshing: 'Refreshing...',
    autoRefresh: 'Auto-refresh every 15 seconds',
    updatedAt: 'Last updated',
    onlineRule: (minutes) => `Online status: activity in the last ${minutes} minutes`,
    metrics: [
      { key: 'online_now', label: 'Online now', helper: 'Active public-web sessions' },
      { key: 'registered_accounts', label: 'Registered accounts', helper: 'All system accounts' },
      { key: 'guest_sessions', label: 'Guest sessions', helper: 'Anonymous sessions tracked so far' },
      { key: 'total_observed_sessions', label: 'Total sessions', helper: 'All observed public-web sessions' },
    ],
    onlineSessionsEyebrow: 'Realtime',
    onlineSessionsTitle: 'Online sessions',
    onlineSessionsCopy: 'Registered accounts and anonymous public-web visitors are shown in one live session table.',
    registeredEyebrow: 'Accounts',
    registeredTitle: 'All registered users',
    registeredCopy: 'Each account shows role, language, last activity, and account creation timing.',
    emptyOnline: 'There are no online public-web sessions right now.',
    emptyRegistered: 'No registered users are available yet.',
    sessionColumns: {
      identity: 'Session / user',
      type: 'Type',
      path: 'Path',
      locale: 'Locale',
      lastSeen: 'Last seen',
    },
    userColumns: {
      user: 'User',
      role: 'Role',
      status: 'Status',
      language: 'Language',
      lastSeen: 'Last seen',
      created: 'Created',
      lastLogin: 'Last login',
    },
    guest: 'Guest',
    registered: 'Registered',
    online: 'Online',
    offline: 'Offline',
    noLastSeen: 'No activity yet',
    noLogin: 'No login yet',
    unknownPath: 'Unknown path',
    pageLabel: (page, totalPages) => `Page ${page} of ${totalPages}`,
    previousPage: 'Previous',
    nextPage: 'Next',
    visitorLabel: 'Visitor',
  },
  ru: {
    eyebrow: 'Пользователи',
    title: 'Живые пользователи и гостевой трафик',
    description:
      'Панель показывает online-сессии public web, анонимных посетителей и все зарегистрированные аккаунты в одном рабочем интерфейсе.',
    refresh: 'Обновить',
    refreshing: 'Обновление...',
    autoRefresh: 'Автообновление каждые 15 секунд',
    updatedAt: 'Последнее обновление',
    onlineRule: (minutes) => `Online-статус: активность за последние ${minutes} минут`,
    metrics: [
      { key: 'online_now', label: 'Сейчас онлайн', helper: 'Активные public web сессии' },
      { key: 'registered_accounts', label: 'Зарегистрированные', helper: 'Все аккаунты системы' },
      { key: 'guest_sessions', label: 'Гостевые сессии', helper: 'Анонимные сессии, зафиксированные системой' },
      { key: 'total_observed_sessions', label: 'Всего сессий', helper: 'Все наблюдаемые public web сессии' },
    ],
    onlineSessionsEyebrow: 'Realtime',
    onlineSessionsTitle: 'Онлайн-сессии',
    onlineSessionsCopy: 'В одной таблице показаны зарегистрированные аккаунты и анонимные посетители public web.',
    registeredEyebrow: 'Accounts',
    registeredTitle: 'Все зарегистрированные пользователи',
    registeredCopy: 'Для каждого аккаунта видны роль, язык, последняя активность и дата регистрации.',
    emptyOnline: 'Сейчас нет активных public web сессий.',
    emptyRegistered: 'Зарегистрированные пользователи пока отсутствуют.',
    sessionColumns: {
      identity: 'Сессия / пользователь',
      type: 'Тип',
      path: 'Страница',
      locale: 'Язык',
      lastSeen: 'Последняя активность',
    },
    userColumns: {
      user: 'Пользователь',
      role: 'Роль',
      status: 'Статус',
      language: 'Язык',
      lastSeen: 'Последняя активность',
      created: 'Создан',
      lastLogin: 'Последний вход',
    },
    guest: 'Гость',
    registered: 'Зарегистрирован',
    online: 'Онлайн',
    offline: 'Оффлайн',
    noLastSeen: 'Активности не было',
    noLogin: 'Входов ещё не было',
    unknownPath: 'Неизвестная страница',
    pageLabel: (page, totalPages) => `Страница ${page} из ${totalPages}`,
    previousPage: 'Назад',
    nextPage: 'Далее',
    visitorLabel: 'Посетитель',
  },
};

const localeFormats: Record<LocaleCode, string> = {
  uz: 'uz-UZ',
  en: 'en-US',
  ru: 'ru-RU',
};

function formatCompactNumber(value: number, locale: LocaleCode) {
  return new Intl.NumberFormat(localeFormats[locale], {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDateTime(value: string | null, locale: LocaleCode, fallback: string) {
  if (!value) {
    return fallback;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(localeFormats[locale], {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
}

function formatRole(value: string) {
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

function buildUsersPageHref(page: number) {
  return page <= 1 ? '/users' : `/users?page=${page}`;
}

function renderSessionIdentity(session: AdminOnlineSession, copy: UsersCopy) {
  return (
    <div className="dashboard-table-cell-stack">
      <strong>{session.display_name}</strong>
      <span>
        {session.email || `${copy.visitorLabel} · ${session.session_key.slice(0, 8)}`}
      </span>
    </div>
  );
}

function renderRegisteredUser(user: AdminRegisteredUser) {
  return (
    <div className="dashboard-table-cell-stack">
      <strong>{user.full_name || user.email}</strong>
      <span>{user.email}</span>
      <span>{user.phone_number}</span>
    </div>
  );
}

export function UsersOverview({ locale, overview }: UsersOverviewProps) {
  const copy = usersCopy[locale];
  const { metrics, online_sessions: onlineSessions, registered_users: registeredUsers } = overview;
  const totalPages = Math.max(1, registeredUsers.total_pages);

  return (
    <div className="users-shell">
      <DashboardHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={
          <UsersAutoRefresh
            refreshLabel={copy.refresh}
            refreshingLabel={copy.refreshing}
            autoRefreshLabel={copy.autoRefresh}
            onlineWindowLabel={copy.onlineRule(overview.online_window_minutes)}
            updatedAtLabel={`${copy.updatedAt}: ${formatDateTime(overview.refreshed_at, locale, copy.noLastSeen)}`}
          />
        }
      />

      <div className="users-metric-grid">
        {copy.metrics.map((metric) => (
          <Card key={metric.key} className="users-metric-card">
            <span>{metric.label}</span>
            <strong>{formatCompactNumber(metrics[metric.key], locale)}</strong>
            <small>{metric.helper}</small>
          </Card>
        ))}
      </div>

      <Card className="users-table-card">
        <div className="dashboard-card-head">
          <div>
            <p className="dashboard-card-overline">{copy.onlineSessionsEyebrow}</p>
            <h2>{copy.onlineSessionsTitle}</h2>
            <p>{copy.onlineSessionsCopy}</p>
          </div>
          <div className="users-card-meta">
            <span className="users-card-meta-label">{copy.online}</span>
            <strong>{formatCompactNumber(metrics.online_now, locale)}</strong>
          </div>
        </div>

        {onlineSessions.length ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table users-table">
              <thead>
                <tr>
                  <th>{copy.sessionColumns.identity}</th>
                  <th>{copy.sessionColumns.type}</th>
                  <th>{copy.sessionColumns.path}</th>
                  <th>{copy.sessionColumns.locale}</th>
                  <th>{copy.sessionColumns.lastSeen}</th>
                </tr>
              </thead>
              <tbody>
                {onlineSessions.map((session) => (
                  <tr key={session.session_key}>
                    <td>{renderSessionIdentity(session, copy)}</td>
                    <td>
                      <span
                        className={classNames(
                          'dashboard-table-pill',
                          'users-table-pill',
                          session.session_type === 'guest' ? 'users-table-pill-guest' : 'users-table-pill-registered',
                        )}
                      >
                        {session.session_type === 'guest' ? copy.guest : copy.registered}
                      </span>
                    </td>
                    <td>
                      <div className="dashboard-table-cell-stack">
                        <strong>{session.current_path || copy.unknownPath}</strong>
                        <span>{session.user_agent || copy.noLastSeen}</span>
                      </div>
                    </td>
                    <td>{session.locale.toUpperCase()}</td>
                    <td>
                      <div className="dashboard-table-cell-stack">
                        <strong>{formatDateTime(session.last_seen_at, locale, copy.noLastSeen)}</strong>
                        <span>{formatDateTime(session.first_seen_at, locale, copy.noLastSeen)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dashboard-table-empty">{copy.emptyOnline}</div>
        )}
      </Card>

      <Card className="users-table-card">
        <div className="dashboard-card-head">
          <div>
            <p className="dashboard-card-overline">{copy.registeredEyebrow}</p>
            <h2>{copy.registeredTitle}</h2>
            <p>{copy.registeredCopy}</p>
          </div>

          <div className="users-pagination-head">
            <span>{copy.pageLabel(registeredUsers.page, totalPages)}</span>
            <div className="users-pagination-controls">
              {registeredUsers.previous_page ? (
                <Link href={buildUsersPageHref(registeredUsers.previous_page)} className="users-pagination-link">
                  {copy.previousPage}
                </Link>
              ) : (
                <span className="users-pagination-link users-pagination-link-disabled">{copy.previousPage}</span>
              )}

              {registeredUsers.next_page ? (
                <Link href={buildUsersPageHref(registeredUsers.next_page)} className="users-pagination-link">
                  {copy.nextPage}
                </Link>
              ) : (
                <span className="users-pagination-link users-pagination-link-disabled">{copy.nextPage}</span>
              )}
            </div>
          </div>
        </div>

        {registeredUsers.results.length ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table users-table">
              <thead>
                <tr>
                  <th>{copy.userColumns.user}</th>
                  <th>{copy.userColumns.role}</th>
                  <th>{copy.userColumns.status}</th>
                  <th>{copy.userColumns.language}</th>
                  <th>{copy.userColumns.lastSeen}</th>
                  <th>{copy.userColumns.created}</th>
                  <th>{copy.userColumns.lastLogin}</th>
                </tr>
              </thead>
              <tbody>
                {registeredUsers.results.map((user) => (
                  <tr key={user.id}>
                    <td>{renderRegisteredUser(user)}</td>
                    <td>{formatRole(user.role)}</td>
                    <td>
                      <span
                        className={classNames(
                          'dashboard-table-pill',
                          'users-table-pill',
                          user.is_online ? 'users-table-pill-online' : 'users-table-pill-offline',
                        )}
                      >
                        {user.is_online ? copy.online : copy.offline}
                      </span>
                    </td>
                    <td>
                      <div className="dashboard-table-cell-stack">
                        <strong>{user.preferred_language?.toUpperCase() || '—'}</strong>
                        <span>{[user.city, user.district].filter(Boolean).join(' · ') || '—'}</span>
                      </div>
                    </td>
                    <td>{formatDateTime(user.last_seen_at, locale, copy.noLastSeen)}</td>
                    <td>{formatDateTime(user.created_at, locale, copy.noLastSeen)}</td>
                    <td>{formatDateTime(user.last_login, locale, copy.noLogin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dashboard-table-empty">{copy.emptyRegistered}</div>
        )}
      </Card>
    </div>
  );
}
