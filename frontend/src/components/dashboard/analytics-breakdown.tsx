import type { ReactNode } from "react";
import type { UrlAnalyticsResponse } from "../../types/api";
import { Monitor, Globe, Calendar } from "lucide-react";

interface AnalyticsBreakdownProps {
  analytics: UrlAnalyticsResponse;
  getDeviceIcon: (device: string) => ReactNode;
}

export function AnalyticsBreakdown({
  analytics,
  getDeviceIcon,
}: AnalyticsBreakdownProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Devices */}
      <div className="surface-card p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
        <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800/80 pb-2">
          <Monitor className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" /> Dispositivos
        </h3>
        <div className="space-y-2">
          {Object.entries(analytics.topDeviceTypes).map(([device, count]) => {
            const percent = Math.round((count / (analytics.totalClicks || 1)) * 100);
            return (
              <div key={device} className="space-y-1 text-xs">
                <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    {getDeviceIcon(device)} {device}
                  </span>
                  <span className="font-mono text-zinc-500 dark:text-zinc-400">
                    {count} ({percent}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-zinc-800 dark:bg-zinc-200 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Browsers & OS */}
      <div className="surface-card p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
        <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800/80 pb-2">
          <Globe className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" /> Navegadores
        </h3>
        <div className="space-y-2">
          {Object.entries(analytics.topBrowsers).slice(0, 4).map(([browser, count]) => {
            const percent = Math.round((count / (analytics.totalClicks || 1)) * 100);
            return (
              <div key={browser} className="space-y-1 text-xs">
                <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
                  <span className="truncate">{browser}</span>
                  <span className="font-mono text-zinc-500 dark:text-zinc-400">
                    {count} ({percent}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-zinc-600 dark:bg-zinc-400 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clicks Timeline */}
      <div className="surface-card p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
        <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800/80 pb-2">
          <Calendar className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" /> Histórico Recente
        </h3>
        <div className="space-y-2">
          {Object.entries(analytics.clicksByDate).length === 0 ? (
            <p className="text-zinc-400 text-xs">Nenhum clique registrado ainda.</p>
          ) : (
            Object.entries(analytics.clicksByDate)
              .slice(-4)
              .reverse()
              .map(([date, count]) => (
                <div
                  key={date}
                  className="flex items-center justify-between text-xs py-1 border-b border-zinc-100 dark:border-zinc-900 last:border-0"
                >
                  <span className="font-mono text-zinc-600 dark:text-zinc-400">{date}</span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    {count} {count === 1 ? "clique" : "cliques"}
                  </span>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
