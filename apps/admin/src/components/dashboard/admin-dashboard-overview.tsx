import { DashboardHeader } from '@/components/layout/dashboard-header';
import { Card } from '@/components/ui/card';
import type { LocaleCode } from '@/lib/i18n';

type Metric = {
  label: string;
  value: string;
};

type ChartDatum = {
  label: string;
  value: number;
  note?: string;
};

type TableRow = {
  apartment: string;
  project: string;
  company: string;
  status: string;
  price: string;
  visibility: string;
};

type AdminDashboardOverviewProps = {
  locale: LocaleCode;
  metrics: Metric[];
  entityMix: ChartDatum[];
  apartmentStatuses: ChartDatum[];
  topCompanies: ChartDatum[];
  tableRows: TableRow[];
};

type DashboardCopy = {
  eyebrow: string;
  title: string;
  description: string;
  summaryEyebrow: string;
  summaryTitle: string;
  summaryCopy: string;
  entityMixEyebrow: string;
  entityMixTitle: string;
  entityMixCopy: string;
  apartmentStatusEyebrow: string;
  apartmentStatusTitle: string;
  apartmentStatusCopy: string;
  topCompaniesEyebrow: string;
  topCompaniesTitle: string;
  topCompaniesCopy: string;
  tableEyebrow: string;
  tableTitle: string;
  tableCopy: string;
  apartment: string;
  project: string;
  company: string;
  status: string;
  price: string;
  visibility: string;
  emptyChart: string;
  emptyTable: string;
};

const dashboardCopy: Record<LocaleCode, DashboardCopy> = {
  uz: {
    eyebrow: 'Operatsiyalar',
    title: 'SaaS boshqaruv paneli',
    description: 'Jonli katalog ma’lumotlari bitta qorong‘i operatsion sirtga jamlandi.',
    summaryEyebrow: 'Snapshot',
    summaryTitle: 'Platforma portfeli',
    summaryCopy: 'Asosiy katalog obyektlari soni bir qarashda ko‘rinadi.',
    entityMixEyebrow: 'Portfolio',
    entityMixTitle: 'Katalog tarkibi',
    entityMixCopy: 'Kompaniyalar, loyihalar, binolar va kvartiralar taqsimoti.',
    apartmentStatusEyebrow: 'Availability',
    apartmentStatusTitle: 'Kvartira statuslari',
    apartmentStatusCopy: 'Hozirgi ombor statuslari bo‘yicha tez ko‘rinish.',
    topCompaniesEyebrow: 'Developers',
    topCompaniesTitle: 'Eng faol kompaniyalar',
    topCompaniesCopy: 'Kvartira inventari eng yuqori bo‘lgan kompaniyalar.',
    tableEyebrow: 'Operations table',
    tableTitle: 'So‘nggi kvartiralar',
    tableCopy: 'Eng yangi katalog birliklari nazorat uchun jadvalda beriladi.',
    apartment: 'Kvartira',
    project: 'Loyiha',
    company: 'Kompaniya',
    status: 'Status',
    price: 'Narx',
    visibility: 'Ko‘rinish',
    emptyChart: 'Chart uchun ma’lumot topilmadi.',
    emptyTable: 'Jadval uchun yozuvlar yo‘q.',
  },
  en: {
    eyebrow: 'Operations',
    title: 'SaaS admin dashboard',
    description: 'Live catalog data is organized into a single dark operational surface.',
    summaryEyebrow: 'Snapshot',
    summaryTitle: 'Portfolio overview',
    summaryCopy: 'Core catalog entity counts stay visible at a glance.',
    entityMixEyebrow: 'Portfolio',
    entityMixTitle: 'Catalog mix',
    entityMixCopy: 'Distribution across companies, projects, buildings, and apartments.',
    apartmentStatusEyebrow: 'Availability',
    apartmentStatusTitle: 'Apartment statuses',
    apartmentStatusCopy: 'Quick view of the current apartment inventory by status.',
    topCompaniesEyebrow: 'Developers',
    topCompaniesTitle: 'Top companies by inventory',
    topCompaniesCopy: 'Companies with the largest apartment inventory right now.',
    tableEyebrow: 'Operations table',
    tableTitle: 'Latest apartments',
    tableCopy: 'Newest catalog units surfaced in a compact action table.',
    apartment: 'Apartment',
    project: 'Project',
    company: 'Company',
    status: 'Status',
    price: 'Price',
    visibility: 'Visibility',
    emptyChart: 'No data available for this chart.',
    emptyTable: 'No apartment rows are available yet.',
  },
  ru: {
    eyebrow: 'Операции',
    title: 'SaaS панель администратора',
    description: 'Живые данные каталога собраны в одной тёмной операционной панели.',
    summaryEyebrow: 'Snapshot',
    summaryTitle: 'Обзор портфеля',
    summaryCopy: 'Ключевые объекты каталога видны с первого взгляда.',
    entityMixEyebrow: 'Portfolio',
    entityMixTitle: 'Состав каталога',
    entityMixCopy: 'Распределение по компаниям, проектам, корпусам и квартирам.',
    apartmentStatusEyebrow: 'Availability',
    apartmentStatusTitle: 'Статусы квартир',
    apartmentStatusCopy: 'Быстрый срез текущего инвентаря квартир по статусам.',
    topCompaniesEyebrow: 'Developers',
    topCompaniesTitle: 'Топ компаний по инвентарю',
    topCompaniesCopy: 'Компании с самым большим запасом квартир на текущий момент.',
    tableEyebrow: 'Operations table',
    tableTitle: 'Последние квартиры',
    tableCopy: 'Новые единицы каталога собраны в компактной рабочей таблице.',
    apartment: 'Квартира',
    project: 'Проект',
    company: 'Компания',
    status: 'Статус',
    price: 'Цена',
    visibility: 'Видимость',
    emptyChart: 'Для этого графика нет данных.',
    emptyTable: 'Строки квартир пока отсутствуют.',
  },
};

function VerticalChart({ items, emptyCopy }: { items: ChartDatum[]; emptyCopy: string }) {
  const maxValue = Math.max(...items.map((item) => item.value), 0);

  if (!items.length || maxValue <= 0) {
    return <div className="dashboard-chart-empty">{emptyCopy}</div>;
  }

  return (
    <div className="dashboard-chart-frame">
      <div className="dashboard-chart-vertical">
        {items.map((item) => (
          <div key={item.label} className="dashboard-chart-column">
            <span className="dashboard-chart-value">{item.value}</span>
            <div className="dashboard-chart-track">
              <div className="dashboard-chart-fill" style={{ height: `${Math.max((item.value / maxValue) * 100, 8)}%` }} />
            </div>
            <span className="dashboard-chart-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HorizontalChart({ items, emptyCopy }: { items: ChartDatum[]; emptyCopy: string }) {
  const maxValue = Math.max(...items.map((item) => item.value), 0);

  if (!items.length || maxValue <= 0) {
    return <div className="dashboard-chart-empty">{emptyCopy}</div>;
  }

  return (
    <div className="dashboard-chart-frame">
      <div className="dashboard-chart-horizontal">
        {items.map((item) => (
          <div key={item.label} className="dashboard-chart-row">
            <div className="dashboard-chart-row-head">
              <div className="dashboard-table-cell-stack">
                <span className="dashboard-chart-row-label">{item.label}</span>
                {item.note ? <span className="dashboard-chart-row-note">{item.note}</span> : null}
              </div>
              <span className="dashboard-chart-row-value">{item.value}</span>
            </div>
            <div className="dashboard-chart-row-track">
              <div className="dashboard-chart-row-fill" style={{ width: `${Math.max((item.value / maxValue) * 100, 4)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboardOverview({
  locale,
  metrics,
  entityMix,
  apartmentStatuses,
  topCompanies,
  tableRows,
}: AdminDashboardOverviewProps) {
  const copy = dashboardCopy[locale];

  return (
    <div className="dashboard-shell">
      <DashboardHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <div className="dashboard-grid">
        <Card className="dashboard-summary-card">
          <div className="dashboard-card-head">
            <div>
              <p className="dashboard-card-overline">{copy.summaryEyebrow}</p>
              <h2>{copy.summaryTitle}</h2>
              <p>{copy.summaryCopy}</p>
            </div>
          </div>

          <div className="dashboard-summary-metrics">
            {metrics.map((metric) => (
              <article key={metric.label} className="dashboard-summary-metric">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </article>
            ))}
          </div>
        </Card>

        <Card className="dashboard-analytics-card">
          <div className="dashboard-card-head">
            <div>
              <p className="dashboard-card-overline">{copy.entityMixEyebrow}</p>
              <h2>{copy.entityMixTitle}</h2>
              <p>{copy.entityMixCopy}</p>
            </div>
          </div>
          <VerticalChart items={entityMix} emptyCopy={copy.emptyChart} />
        </Card>

        <Card className="dashboard-analytics-card">
          <div className="dashboard-card-head">
            <div>
              <p className="dashboard-card-overline">{copy.apartmentStatusEyebrow}</p>
              <h2>{copy.apartmentStatusTitle}</h2>
              <p>{copy.apartmentStatusCopy}</p>
            </div>
          </div>
          <HorizontalChart items={apartmentStatuses} emptyCopy={copy.emptyChart} />
        </Card>

        <Card className="dashboard-analytics-card">
          <div className="dashboard-card-head">
            <div>
              <p className="dashboard-card-overline">{copy.topCompaniesEyebrow}</p>
              <h2>{copy.topCompaniesTitle}</h2>
              <p>{copy.topCompaniesCopy}</p>
            </div>
          </div>
          <HorizontalChart items={topCompanies} emptyCopy={copy.emptyChart} />
        </Card>

        <Card className="dashboard-table-card">
          <div className="dashboard-table-head">
            <p className="dashboard-card-overline">{copy.tableEyebrow}</p>
            <h2>{copy.tableTitle}</h2>
            <p>{copy.tableCopy}</p>
          </div>

          {tableRows.length ? (
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>{copy.apartment}</th>
                    <th>{copy.project}</th>
                    <th>{copy.company}</th>
                    <th>{copy.status}</th>
                    <th>{copy.price}</th>
                    <th>{copy.visibility}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <tr key={`${row.apartment}-${row.project}-${row.company}`}>
                      <td>
                        <div className="dashboard-table-cell-stack">
                          <strong>{row.apartment}</strong>
                        </div>
                      </td>
                      <td>{row.project}</td>
                      <td>{row.company}</td>
                      <td>
                        <span className="dashboard-table-pill">{row.status}</span>
                      </td>
                      <td>{row.price}</td>
                      <td>{row.visibility}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="dashboard-table-empty">{copy.emptyTable}</div>
          )}
        </Card>
      </div>
    </div>
  );
}
