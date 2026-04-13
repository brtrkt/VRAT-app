import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getAllVrats } from "@/data/vrats";
import {
  getFullHistory,
  getVratSummaries,
  checkBadges,
  markBadgesSeen,
  type HistoryEntry,
  type VratSummary,
  type BadgeResult,
} from "@/hooks/useVratHistory";
import { ChevronLeft } from "lucide-react";

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function BadgeCard({ badge }: { badge: BadgeResult }) {
  if (!badge.earned) return null;
  return (
    <div
      className="rounded-2xl p-4 mb-3 border"
      style={{
        background: "linear-gradient(135deg, #FEF3E2 0%, #FFF9F0 100%)",
        borderColor: "rgba(224,123,42,0.35)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #E07B2A 0%, #F5A623 100%)" }}
        >
          {badge.id === "shubh-aarambh" && "🪔"}
          {badge.id === "ekadashi-sevak" && "🌙"}
          {badge.id === "navdurga-bhakt" && "🪷"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-serif font-bold text-foreground text-sm">{badge.name}</p>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
              style={{ background: "linear-gradient(135deg, #E07B2A 0%, #C86B1A 100%)" }}
            >
              Earned
            </span>
          </div>
          <p className="text-xs text-amber-700 font-medium mb-0.5">{badge.subtitle}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{badge.description}</p>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ summary }: { summary: VratSummary }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-2">
        {summary.vrat.nirjala && (
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#D4A017" }} />
        )}
        <span className="text-sm font-medium text-foreground">{summary.vrat.name}</span>
      </div>
      <span
        className="text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ background: "rgba(224,123,42,0.12)", color: "#C86B1A" }}
      >
        {summary.count}×
      </span>
    </div>
  );
}

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {entry.isNirjala && (
          <span className="text-xs" title="Nirjala fast" aria-label="Nirjala fast">✦</span>
        )}
        <span className="text-sm text-foreground font-medium truncate">{entry.vratName}</span>
      </div>
      <span className="text-xs text-muted-foreground ml-3 flex-shrink-0">{formatDate(entry.date)}</span>
    </div>
  );
}

export default function VratHistory() {
  const [, setLocation] = useLocation();
  const allVrats = getAllVrats();
  const [history] = useState<HistoryEntry[]>(() => getFullHistory(allVrats));
  const [summaries] = useState<VratSummary[]>(() => getVratSummaries(allVrats));
  const [badges] = useState<BadgeResult[]>(() => checkBadges(allVrats));

  useEffect(() => {
    const newlyEarned = badges.filter((b) => b.newlyEarned).map((b) => b.id);
    if (newlyEarned.length > 0) markBadgesSeen(newlyEarned);
  }, [badges]);

  const earnedBadges = badges.filter((b) => b.earned);
  const totalObservations = history.length;

  return (
    <div className="min-h-screen cream-gradient">
      <div className="max-w-md mx-auto px-4 pt-8 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setLocation("/")}
            className="w-10 h-10 rounded-full bg-card border border-card-border flex items-center justify-center text-foreground hover:bg-muted transition-colors"
            aria-label="Back to home"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">My Vrat History</h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              {totalObservations === 0
                ? "No observations yet"
                : `${totalObservations} observation${totalObservations === 1 ? "" : "s"} recorded`}
            </p>
          </div>
        </div>

        {totalObservations === 0 && (
          <div className="vrat-card p-6 text-center mb-4">
            <p className="text-3xl mb-3">🪔</p>
            <p className="font-serif text-base font-semibold text-foreground mb-1">
              Your journey begins here
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Open any vrat in the Calendar and tap{" "}
              <span className="font-medium text-foreground">"I observed this vrat"</span>{" "}
              to start building your history.
            </p>
          </div>
        )}

        {earnedBadges.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3 px-1">
              Milestones Earned
            </p>
            {earnedBadges.map((b) => (
              <BadgeCard key={b.id} badge={b} />
            ))}
          </div>
        )}

        {summaries.length > 0 && (
          <div className="vrat-card p-5 mb-4">
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
              Observation Count
            </p>
            {summaries.map((s) => (
              <SummaryRow key={s.vrat.id} summary={s} />
            ))}
            {summaries.some((s) => s.vrat.nirjala) && (
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#D4A017" }} />
                Gold dot indicates a nirjala (waterless) fast
              </p>
            )}
          </div>
        )}

        {history.length > 0 && (
          <div className="vrat-card p-5 mb-4">
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
              Full Log
            </p>
            {history.map((entry, i) => (
              <HistoryRow key={`${entry.vratId}-${entry.date}-${i}`} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
