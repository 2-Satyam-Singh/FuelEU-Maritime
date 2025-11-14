import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { Loader2, Filter, CheckCircle2, Circle } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const formatNumber = (value) =>
  Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const RoutesTab = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ vesselType: "all", fuelType: "all", year: "all" });

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/routes`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRoutes(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch routes", err);
      setError(err.message || "Unable to fetch routes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const setBaseline = async (routeId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/routes/${routeId}/baseline`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to set baseline");
      toast.success(`Baseline updated to ${routeId}`);
      fetchRoutes();
    } catch (err) {
      console.error("Baseline error", err);
      toast.error(err.message || "Unable to set baseline");
    }
  };

  const vesselTypes = useMemo(() => Array.from(new Set(routes.map((route) => route.vesselType))).sort(), [routes]);
  const fuelTypes = useMemo(() => Array.from(new Set(routes.map((route) => route.fuelType))).sort(), [routes]);
  const years = useMemo(() => Array.from(new Set(routes.map((route) => route.year))).sort(), [routes]);

  const filteredRoutes = routes.filter((route) => {
    const vesselMatch = filters.vesselType === "all" || route.vesselType === filters.vesselType;
    const fuelMatch = filters.fuelType === "all" || route.fuelType === filters.fuelType;
    const yearMatch = filters.year === "all" || route.year === Number(filters.year);
    return vesselMatch && fuelMatch && yearMatch;
  });

  const handleFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-xl bg-rose-50 p-4 text-rose-600">Failed to load routes: {error}</div>;
  }

  return (
    <div className="space-y-6" data-testid="routes-tab-content">
      <div className="glass-card overflow-hidden rounded-3xl border border-white/70 bg-white/95">
        <div className="px-6 py-6 sm:px-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Route Management</h2>
              <p className="text-sm text-white/70">View and manage vessel routes</p>
            </div>
            <div className="w-full rounded-2xl bg-white/10 p-4 text-white">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Filter className="h-4 w-4" /> Filters
              </div>
              <div className="grid gap-3 md:grid-cols-3 text-slate-800">
                <Select value={filters.vesselType} onValueChange={(value) => handleFilter("vesselType", value)}>
                  <SelectTrigger className="h-10 rounded-xl border-white/30 bg-white/90">
                    <SelectValue placeholder="Vessel Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vessels</SelectItem>
                    {vesselTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.fuelType} onValueChange={(value) => handleFilter("fuelType", value)}>
                  <SelectTrigger className="h-10 rounded-xl border-white/30 bg-white/90">
                    <SelectValue placeholder="Fuel Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fuels</SelectItem>
                    {fuelTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={String(filters.year)} onValueChange={(value) => handleFilter("year", value)}>
                  <SelectTrigger className="h-10 rounded-xl border-white/30 bg-white/90">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map((yearOption) => (
                      <SelectItem key={yearOption} value={String(yearOption)}>
                        {yearOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1024px] border-separate border-spacing-x-4 border-spacing-y-2">
            <thead>
              <tr className="bg-slate-50 text-[13px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 text-left">Route ID</th>
                <th className="px-4 py-3 text-left">Vessel Type</th>
                <th className="px-4 py-3 text-left">Fuel Type</th>
                <th className="px-4 py-3 text-left">Year</th>
                <th className="px-4 py-3 text-left">GHG Intensity (gCO₂e/MJ)</th>
                <th className="px-4 py-3 text-left">Fuel Consumption (t)</th>
                <th className="px-4 py-3 text-left">Distance (km)</th>
                <th className="px-4 py-3 text-left">Total Emissions (t)</th>
                <th className="px-4 py-3 text-left">Baseline</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutes.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-6 text-center text-slate-500">
                    No routes match the selected filters.
                  </td>
                </tr>
              )}
              {filteredRoutes.map((route) => (
                <tr key={route.routeId} className="border-t border-slate-100 text-sm text-slate-700">
                  <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{route.routeId}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{route.vesselType}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{route.fuelType}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{route.year}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatNumber(route.ghgIntensity)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatNumber(route.fuelConsumption)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatNumber(route.distance)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatNumber(route.totalEmissions)}</td>
                  <td className="px-4 py-3">
                    {route.isBaseline ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" /> Baseline
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-500">
                        <Circle className="h-4 w-4" /> Not Set
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      disabled={route.isBaseline}
                      onClick={() => setBaseline(route.routeId)}
                      className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white disabled:from-purple-300 disabled:to-purple-300"
                    >
                      {route.isBaseline ? "Baseline Set" : "Set as Baseline"}
                    </Button>
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

export default RoutesTab;
