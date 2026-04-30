import { useEffect, useState, useCallback } from "react";
import { Link } from "wouter";
import { ChevronLeft, RefreshCw, Search, X } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const ERROR_TYPE_LABELS: Record<string, string> = {
  "wrong-date": "Wrong date",
  "missing-food": "Missing food",
  "wrong-mantra": "Wrong mantra",
  "app-not-loading": "App not loading",
  other: "Other",
};

const ERROR_TYPE_COLORS: Record<string, string> = {
  "wrong-date": "#DC2626",
  "missing-food": "#F59E0B",
  "wrong-mantra": "#7C3AED",
  "app-not-loading": "#0EA5E9",
  other: "#6B7280",
};

interface ReportRow {
  id: string;
  error_type: string;
  tradition: string | null;
  page: string | null;
  notes: string | null;
  user_agent: string | null;
  created_at: string;
}

interface Stats {
  total: number;
  byErrorType: Array<{ error_type: string; count: number }>;
  byTradition: Array<{ tradition: string | null; count: number }>;
  last7Days: number;
  last24Hours: number;
}

const PAGE_SIZE = 50;

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="vrat-card p-3 flex flex-col items-center justify-center text-center">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </div>
      <div
        className="font-serif text-2xl font-bold mt-0.5"
        style={{ color: accent ?? "#78350F" }}
      >
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide text-white"
      style={{ background: color }}
    >
      {label}
    </span>
  );
}

export default function AdminErrorReports() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [errorType, setErrorType] = useState<string>("");
  const [tradition, setTradition] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [qInput, setQInput] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const loadReports = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const params = new URLSearchParams();
      if (errorType) params.set("errorType", errorType);
      if (tradition) params.set("tradition", tradition);
      if (q) params.set("q", q);
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(offset));

      const res = await fetch(`${API_BASE}/api/error-reports?${params.toString()}`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setReports(data.reports ?? []);
      setTotal(data.total ?? 0);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load reports");
      setReports([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [errorType, tradition, q, offset]);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/error-reports/stats`);
      if (!res.ok) return;
      const data = await res.json();
      setStats(data);
    } catch {
      // stats are optional decoration; ignore
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  function applyFilter<T>(setter: (v: T) => void, value: T) {
    setter(value);
    setOffset(0);
  }

  function clearFilters() {
    setErrorType("");
    setTradition("");
    setQ("");
    setQInput("");
    setOffset(0);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setQ(qInput.trim());
    setOffset(0);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const hasFilters = !!(errorType || tradition || q);

  return (
    <div className="min-h-screen cream-gradient">
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-24">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft size={16} />
              Back
            </button>
          </Link>
          <button
            onClick={() => {
              loadReports();
              loadStats();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: "rgba(120,53,15,0.08)", color: "#78350F" }}
            data-testid="admin-refresh"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="mb-5">
          <h1 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
            <span aria-hidden="true">🪔</span>
            Error Reports
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            User-submitted reports from the in-app "Report" button
          </p>
        </div>

        {/* Stats summary */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            <StatCard label="Total" value={stats.total} accent="#78350F" />
            <StatCard label="Last 7 days" value={stats.last7Days} accent="#E07B2A" />
            <StatCard label="Last 24 hours" value={stats.last24Hours} accent="#DC2626" />
          </div>
        )}

        {/* Top error types */}
        {stats && stats.byErrorType.length > 0 && (
          <div className="vrat-card p-4 mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              By error type
            </h2>
            <div className="flex flex-wrap gap-2">
              {stats.byErrorType.map((b) => (
                <button
                  key={b.error_type}
                  onClick={() => applyFilter(setErrorType, errorType === b.error_type ? "" : b.error_type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                    errorType === b.error_type ? "ring-2 ring-offset-1" : "hover:opacity-80"
                  }`}
                  style={{
                    background: ERROR_TYPE_COLORS[b.error_type] ?? "#6B7280",
                    color: "white",
                  }}
                >
                  {ERROR_TYPE_LABELS[b.error_type] ?? b.error_type}
                  <span className="bg-white/25 rounded-full px-1.5 py-0.5 text-[10px]">
                    {b.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="vrat-card p-4 mb-5 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Error type
              </label>
              <select
                value={errorType}
                onChange={(e) => applyFilter(setErrorType, e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white text-sm text-foreground focus:outline-none focus:ring-2"
                style={{ border: "1px solid rgba(224,123,42,0.3)" }}
                data-testid="filter-error-type"
              >
                <option value="">All types</option>
                {Object.entries(ERROR_TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Tradition
              </label>
              <select
                value={tradition}
                onChange={(e) => applyFilter(setTradition, e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white text-sm text-foreground focus:outline-none focus:ring-2"
                style={{ border: "1px solid rgba(224,123,42,0.3)" }}
                data-testid="filter-tradition"
              >
                <option value="">All traditions</option>
                {stats?.byTradition.map((b) => (
                  <option key={b.tradition ?? "__none__"} value={b.tradition ?? ""}>
                    {b.tradition ?? "(none)"} ({b.count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={submitSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Search notes or page…"
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-white text-sm text-foreground focus:outline-none focus:ring-2"
                style={{ border: "1px solid rgba(224,123,42,0.3)" }}
                data-testid="filter-search"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide text-white"
              style={{ background: "linear-gradient(135deg, #FF6F00 0%, #E65100 100%)" }}
            >
              Search
            </button>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: "rgba(120,53,15,0.08)", color: "#78350F" }}
                data-testid="filter-clear"
              >
                <X size={12} /> Clear
              </button>
            )}
          </form>
        </div>

        {/* Results */}
        {errorMsg && (
          <div
            className="text-xs px-3 py-2 rounded-lg mb-3"
            style={{ background: "rgba(220,38,38,0.10)", color: "#991B1B" }}
          >
            {errorMsg}
          </div>
        )}

        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-xs text-muted-foreground">
            {loading
              ? "Loading…"
              : `${total.toLocaleString()} report${total === 1 ? "" : "s"}${
                  hasFilters ? " (filtered)" : ""
                }`}
          </p>
          {totalPages > 1 && (
            <p className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>

        {!loading && reports.length === 0 ? (
          <div className="vrat-card p-8 text-center">
            <div className="text-3xl mb-2" aria-hidden="true">🪔</div>
            <p className="text-sm text-foreground/70">
              {hasFilters ? "No reports match these filters." : "No reports yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map((r) => (
              <div key={r.id} className="vrat-card p-3" data-testid={`report-${r.id}`}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      label={ERROR_TYPE_LABELS[r.error_type] ?? r.error_type}
                      color={ERROR_TYPE_COLORS[r.error_type] ?? "#6B7280"}
                    />
                    {r.tradition && (
                      <span className="text-[11px] font-semibold text-foreground/80">
                        {r.tradition}
                      </span>
                    )}
                    {r.page && (
                      <span className="text-[11px] text-muted-foreground">
                        · {r.page}
                      </span>
                    )}
                  </div>
                  <span
                    className="text-[10px] text-muted-foreground whitespace-nowrap"
                    title={new Date(r.created_at).toLocaleString()}
                  >
                    {formatRelative(r.created_at)}
                  </span>
                </div>
                {r.notes ? (
                  <p className="text-sm text-foreground/85 leading-snug whitespace-pre-wrap">
                    {r.notes}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No details provided</p>
                )}
                {r.user_agent && (
                  <p className="text-[10px] text-muted-foreground mt-2 truncate" title={r.user_agent}>
                    {r.user_agent}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-5">
            <button
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              disabled={offset === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
              style={{ background: "rgba(120,53,15,0.08)", color: "#78350F" }}
            >
              ← Previous
            </button>
            <button
              onClick={() => setOffset(offset + PAGE_SIZE)}
              disabled={offset + PAGE_SIZE >= total}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
              style={{ background: "rgba(120,53,15,0.08)", color: "#78350F" }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
