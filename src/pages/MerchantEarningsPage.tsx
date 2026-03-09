import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import {
  IndianRupee, ShoppingBag, Percent, Clock,
  CheckCircle2, XCircle, Loader2, Banknote,
  ChevronDown, AlertCircle, ChevronLeft,
} from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import {
  Period,
  useEarningsSummary,
  useEarningsChart,
  useSettlementHistory,
  useTopProducts,
} from "@/hooks/useEarnings";

// ─── helpers ────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L`
  : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K`
  : `₹${n}`;

const fmtFull = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const STATUS_CONFIG = {
  completed:  { icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-50",  label: "Paid" },
  processing: { icon: Loader2,      color: "text-amber-600",  bg: "bg-amber-50",  label: "Processing" },
  pending:    { icon: Clock,        color: "text-slate-500",  bg: "bg-muted",     label: "Pending" },
  failed:     { icon: XCircle,      color: "text-red-500",    bg: "bg-red-50",    label: "Failed" },
} as const;

// ─── sub-components ─────────────────────────────────────────────────────────

function PeriodToggle({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const tabs: { label: string; value: Period }[] = [
    { label: "Daily",   value: "daily"   },
    { label: "Weekly",  value: "weekly"  },
    { label: "Monthly", value: "monthly" },
  ];
  return (
    <div className="flex bg-muted rounded-xl p-1 gap-1">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all duration-200 ${
            value === t.value
              ? "bg-card text-primary shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, sub, iconClass = "text-primary", loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  iconClass?: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className={`w-5 h-5 ${iconClass}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        {loading
          ? <div className="h-5 w-20 bg-muted animate-pulse rounded mt-1" />
          : <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
        }
        {sub && !loading && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-foreground mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground">{fmtFull(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── page ────────────────────────────────────────────────────────────────────

export function MerchantEarningsPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("weekly");
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  const [showAllSettlements, setShowAllSettlements] = useState(false);

  const summary     = useEarningsSummary(period);
  const chart       = useEarningsChart(period);
  const settlements = useSettlementHistory();
  const topProducts = useTopProducts(period);

  const s = summary.data;
  const chartData = chart.data ?? [];
  const settlementData = showAllSettlements
    ? (settlements.data ?? [])
    : (settlements.data ?? []).slice(0, 4);

  return (
    <MobileLayout navType="merchant">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {s?.periodLabel ?? "Loading..."}
          </p>
          <h1 className="text-2xl font-bold text-foreground mt-0.5">Earnings</h1>
        </div>
      </header>

      <div className="px-4 pb-28 space-y-5">

        {/* Period Toggle */}
        <PeriodToggle value={period} onChange={setPeriod} />

        {/* Hero Card */}
        <div
          className="rounded-3xl overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 60%, #c2410c 100%)" }}
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border-[32px] border-white/10" />
          <div className="absolute -bottom-8 -left-6 w-32 h-32 rounded-full border-[20px] border-white/10" />
          <div className="relative p-5">
            <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-1">
              Net Earnings · {s?.periodLabel ?? "..."}
            </p>
            {summary.isLoading
              ? <div className="h-10 w-36 bg-white/20 animate-pulse rounded-xl" />
              : <p className="text-white text-4xl font-black tracking-tight">{fmtFull(s?.netEarnings ?? 0)}</p>
            }
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: "Revenue",    val: s?.totalRevenue    ?? 0 },
                { label: "Commission", val: s?.totalCommission ?? 0 },
                { label: "Orders",     val: s?.totalOrders     ?? 0, noRupee: true },
              ].map((item) => (
                <div key={item.label} className="bg-white/15 rounded-xl p-2.5">
                  <p className="text-orange-100 text-[10px] font-medium">{item.label}</p>
                  {summary.isLoading
                    ? <div className="h-4 w-12 bg-white/20 animate-pulse rounded mt-1" />
                    : <p className="text-white font-bold text-sm mt-0.5">
                        {item.noRupee ? item.val : fmt(item.val)}
                      </p>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stat Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={IndianRupee}
            label="Avg Order Value"
            value={fmtFull(s?.avgOrderValue ?? 0)}
            loading={summary.isLoading}
          />
          <StatCard
            icon={Banknote}
            label="Pending Settlement"
            value={fmtFull(s?.pendingSettlement ?? 0)}
            sub="Approx. net"
            iconClass="text-amber-600"
            loading={summary.isLoading}
          />
          <StatCard
            icon={Percent}
            label="Commission Rate"
            value={s && s.totalRevenue > 0
              ? `${((s.totalCommission / s.totalRevenue) * 100).toFixed(1)}%`
              : "—"}
            sub="Platform fee"
            loading={summary.isLoading}
          />
          <StatCard
            icon={ShoppingBag}
            label="Total Orders"
            value={String(s?.totalOrders ?? 0)}
            sub="Delivered + Completed"
            loading={summary.isLoading}
          />
        </div>

        {/* Revenue Chart */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Revenue Trend</h3>
            <div className="flex bg-muted rounded-lg p-0.5 gap-0.5">
              {(["area", "bar"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all ${
                    chartType === t ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  {t === "area" ? "Line" : "Bar"}
                </button>
              ))}
            </div>
          </div>

          {chart.isLoading ? (
            <div className="h-48 bg-muted rounded-xl animate-pulse" />
          ) : chartData.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <AlertCircle className="w-8 h-8 opacity-40" />
              <p className="text-xs">No data for this period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              {chartType === "area" ? (
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={fmt} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#f97316" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 4 }} />
                  <Area type="monotone" dataKey="net"     name="Net"     stroke="#10b981" strokeWidth={2}   fill="url(#netGrad)" dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={fmt} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="revenue"    name="Revenue"    fill="#fed7aa" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="net"        name="Net"        fill="#f97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="commission" name="Commission" fill="#fca5a5" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders Volume */}
        {!chart.isLoading && chartData.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Orders Volume</h3>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={chartData} margin={{ top: 0, right: 4, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="bg-card border border-border rounded-lg shadow px-3 py-2 text-xs">
                        <p className="font-semibold text-foreground">{label}</p>
                        <p className="text-primary font-bold">{payload[0].value} orders</p>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="orders" fill="#f97316" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Products */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-foreground mb-3">Top Products</h3>
          {topProducts.isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-xl animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                    <div className="h-2 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                  <div className="h-4 w-14 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (topProducts.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No product data available</p>
          ) : (
            <div className="space-y-3">
              {(topProducts.data ?? []).map((p, idx) => {
                const maxRev = topProducts.data![0].revenue;
                const pct = maxRev > 0 ? (p.revenue / maxRev) * 100 : 0;
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                          {p.orders} orders
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-foreground flex-shrink-0">{fmt(p.revenue)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Settlement History */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Settlement History</h3>
            {(settlements.data ?? []).length > 4 && (
              <button
                onClick={() => setShowAllSettlements((v) => !v)}
                className="text-xs text-primary font-medium flex items-center gap-1"
              >
                {showAllSettlements ? "Show less" : "View all"}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllSettlements ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>

          {settlements.isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-muted rounded-xl animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                    <div className="h-2 bg-muted rounded animate-pulse w-1/3" />
                  </div>
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : settlementData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Banknote className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No settlements yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {settlementData.map((item) => {
                const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                return (
                  <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon
                        className={`w-4 h-4 ${cfg.color} ${item.status === "processing" ? "animate-spin" : ""}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{fmtFull(item.amount)}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.utr_number
                          ? `UTR: ${item.utr_number}`
                          : new Date(item.initiated_at).toLocaleDateString("en-IN", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                      </p>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-lg ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Commission Info */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Percent className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Commission Structure</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Platform Commission", value: "8–12%",    sub: "Varies by category"   },
              { label: "Payment Gateway",      value: "1.5–2%",  sub: "On gross order value" },
              { label: "Settlement Cycle",     value: "T+2 days",sub: "Business days"         },
              { label: "Minimum Payout",       value: "₹500",    sub: "Per settlement"        },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">{row.label}</p>
                  <p className="text-[10px] text-muted-foreground">{row.sub}</p>
                </div>
                <span className="text-primary font-bold text-sm">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </MobileLayout>
  );
}