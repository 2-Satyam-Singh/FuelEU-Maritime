import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { Loader2, TrendingUp, TrendingDown, CheckCircle, XCircle } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
const API = BACKEND_URL;
const TARGET_INTENSITY = 89.3368;

const CompareTab = () => {
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparisons = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/routes/comparison`);
        const normalized = response.data.map((entry) => ({
          routeId: entry.route_id,
          ghgIntensity: entry.ghg_intensity,
          baselineIntensity: entry.baseline_intensity ?? TARGET_INTENSITY,
          percentDiff: entry.percent_diff ?? 0,
          compliant: entry.compliant,
        }));
        setComparisons(normalized);
      } catch (error) {
        console.error("Error fetching comparisons:", error);
        toast.error("Failed to fetch comparison data");
      } finally {
        setLoading(false);
      }
    };

    fetchComparisons();
  }, []);

  const compliantCount = comparisons.filter((c) => c.compliant).length;
  const nonCompliantCount = comparisons.length - compliantCount;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="compare-loading">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="compare-tab-content">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="glass-card rounded-2xl border border-white/70 bg-white/95 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Target Intensity</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{TARGET_INTENSITY.toFixed(2)}</p>
              <p className="text-sm text-slate-500">gCO₂e/MJ</p>
            </div>
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-white/70 bg-white/95 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Compliant Routes</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-600">{compliantCount}</p>
              <p className="text-sm text-slate-500">out of {comparisons.length}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-white/70 bg-white/95 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Non-Compliant</p>
              <p className="mt-2 text-3xl font-semibold text-rose-600">{nonCompliantCount}</p>
              <p className="text-sm text-slate-500">routes</p>
            </div>
            <div className="rounded-2xl bg-rose-50 p-3 text-rose-500">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden rounded-3xl border border-white/70 bg-white/95">
        <div className="px-6 sm:px-8 py-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500">
          <h2 className="text-xl font-semibold text-white">GHG Intensity Comparison</h2>
          <p className="text-sm text-white/70">Route performance against target</p>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={comparisons}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="routeId" stroke="#94a3b8" />
              <YAxis
                stroke="#94a3b8"
                label={{ value: "gCO₂e/MJ", angle: -90, position: "insideLeft", fill: "#475569" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255,255,255,0.95)",
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                  boxShadow: "0 20px 50px rgba(15,23,42,0.1)",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 12 }} />
              <Bar dataKey="baselineIntensity" fill="#34d399" name="Baseline" radius={[10, 10, 0, 0]} />
              <Bar dataKey="ghgIntensity" fill="#6366f1" name="GHG Intensity" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card overflow-hidden rounded-3xl border border-white/70 bg-white/95">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500/80">
                <th className="px-6 py-4">Route ID</th>
                <th className="px-6 py-4">GHG Intensity</th>
                <th className="px-6 py-4">Baseline</th>
                <th className="px-6 py-4">% Difference</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((comp, idx) => (
                <tr
                  key={comp.routeId}
                  className="border-t border-slate-100/70 hover:bg-indigo-50/40 transition-colors"
                  data-testid={`comparison-row-${idx}`}
                >
                  <td className="px-6 py-4 font-semibold text-slate-900">{comp.routeId}</td>
                  <td className="px-6 py-4 text-slate-600">{comp.ghgIntensity.toFixed(2)} gCO₂e/MJ</td>
                  <td className="px-6 py-4 text-slate-600">{comp.baselineIntensity.toFixed(2)} gCO₂e/MJ</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-2 font-semibold ${
                        comp.percentDiff > 0 ? "text-rose-500" : "text-emerald-500"
                      }`}
                    >
                      {comp.percentDiff > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {Math.abs(comp.percentDiff).toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {comp.compliant ? (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-600"
                        data-testid={`compliant-badge-${idx}`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Compliant
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-sm font-semibold text-rose-600"
                        data-testid={`non-compliant-badge-${idx}`}
                      >
                        <XCircle className="w-4 h-4" />
                        Non-Compliant
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompareTab;
