import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { Loader2, Wallet, PiggyBank, TrendingUp } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
const API = BACKEND_URL;
const TARGET_INTENSITY = 89.3368;

const BankingTab = () => {
  const [shipId, setShipId] = useState("R002");
  const [year, setYear] = useState(2024);
  const [cb, setCb] = useState(null);
  const [adjustedCb, setAdjustedCb] = useState(null);
  const [bankAmount, setBankAmount] = useState("");
  const [applyAmount, setApplyAmount] = useState("");
  const [applyShipId, setApplyShipId] = useState("R001");
  const [bankingRecords, setBankingRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const normalizeShipId = (value) => value.trim().toUpperCase();
  const formatMillions = (value = 0) => (Number(value || 0) / 1000000).toFixed(2);
  const formatSignedMillions = (value = 0) => `${value >= 0 ? '+' : '-'}${formatMillions(Math.abs(value))}`;
  const cbValue = cb ? Number(cb.cbGco2eq ?? cb.cb_gco2eq ?? 0) : 0;
  const actualIntensity = cb ? Number(cb.actualIntensity ?? cb.actual_intensity ?? 0) : null;
  const targetIntensity = cb ? Number(cb.targetIntensity ?? cb.target_intensity ?? TARGET_INTENSITY) : TARGET_INTENSITY;
  const adjustedValue = adjustedCb ? Number(adjustedCb.adjustedCb ?? adjustedCb.adjusted_cb ?? cbValue) : null;
  const adjustedNet = adjustedCb ? Number(adjustedCb.netBanked ?? adjustedCb.total_banked_applied ?? 0) : 0;
  const cbAfter = adjustedValue ?? cbValue + adjustedNet;

  const fetchCB = async () => {
    try {
      setLoading(true);
      const normalizedShip = normalizeShipId(shipId);
      const response = await axios.get(`${API}/compliance/cb?shipId=${normalizedShip}&year=${year}`);
      setCb(response.data);
      setAdjustedCb(null);
      toast.success("Compliance balance calculated");
    } catch (error) {
      console.error("Error fetching CB:", error);
      toast.error(error.response?.data?.error || error.message || "Failed to fetch compliance balance");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdjustedCB = async () => {
    try {
      const normalizedShip = normalizeShipId(shipId);
      const response = await axios.get(`${API}/compliance/adjusted-cb?shipId=${normalizedShip}&year=${year}`);
      setAdjustedCb(response.data);
    } catch (error) {
      console.error("Error fetching adjusted CB:", error);
    }
  };

  const fetchBankingRecords = async () => {
    try {
      const normalizedShip = normalizeShipId(shipId);
      const response = await axios.get(`${API}/banking/records?shipId=${normalizedShip}&year=${year}`);
      setBankingRecords(response.data);
    } catch (error) {
      console.error("Error fetching banking records:", error);
    }
  };

  useEffect(() => {
    if (cb) {
      fetchAdjustedCB();
      fetchBankingRecords();
    }
  }, [cb]);

  const handleBankSurplus = async () => {
    try {
      await axios.post(`${API}/banking/bank`, {
        shipId: normalizeShipId(shipId),
        year,
        amount: parseFloat(bankAmount)
      });
      toast.success("Surplus banked successfully");
      setBankAmount("");
      fetchCB();
    } catch (error) {
      console.error("Error banking surplus:", error);
      toast.error(error.response?.data?.error || "Failed to bank surplus");
    }
  };

  const handleApplyBanked = async () => {
    try {
      await axios.post(`${API}/banking/apply`, {
        fromShipId: normalizeShipId(shipId),
        toShipId: normalizeShipId(applyShipId),
        year,
        amount: parseFloat(applyAmount)
      });
      toast.success("Banked surplus applied successfully");
      setApplyAmount("");
      fetchCB();
    } catch (error) {
      console.error("Error applying banked:", error);
      toast.error(error.response?.data?.error || "Failed to apply banked surplus");
    }
  };

  return (
    <div className="space-y-6" data-testid="banking-tab-content">
      {/* Input Section */}
      <div className="glass-card rounded-3xl border border-white/70 bg-white/95 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">Banking</p>
            <h2 className="text-xl font-semibold text-slate-900">Banking Overview</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label className="text-sm font-medium text-slate-600">Ship ID</Label>
            <Input
              type="text"
              value={shipId}
              onChange={(e) => setShipId(e.target.value.toUpperCase())}
              placeholder="R002"
              className="mt-2 rounded-2xl border-slate-200 bg-white/80"
              data-testid="ship-id-input"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-600">Year</Label>
            <Input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              placeholder="2025"
              min={2024}
              max={2025}
              className="mt-2 rounded-2xl border-slate-200 bg-white/80"
              data-testid="year-input"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={fetchCB}
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 py-5 text-base font-semibold text-white shadow-[0_15px_35px_rgba(99,102,241,0.4)]"
              data-testid="calculate-cb-btn"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Calculate CB"}
            </Button>
          </div>
        </div>
      </div>

      {/* CB Display */}
      {cb && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="glass-card rounded-2xl border border-white/70 bg-white/95 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Original CB</p>
                  <p className={`text-3xl font-bold mt-1 ${
                    cbValue > 0 ? 'text-green-600' : 'text-red-600'
                  }`} data-testid="original-cb-value">
                    {formatMillions(cbValue)}M
                  </p>
                  <p className="text-xs text-slate-500 mt-1">gCO₂eq</p>
                </div>
                <div className={`p-3 rounded-xl ${
                  cbValue > 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <TrendingUp className={`w-6 h-6 ${
                    cbValue > 0 ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Actual Intensity</span>
                  <span className="font-semibold text-slate-900">{(actualIntensity ?? 0).toFixed(2)} gCO₂e/MJ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Target Intensity</span>
                  <span className="font-semibold text-slate-900">{targetIntensity.toFixed(2)} gCO₂e/MJ</span>
                </div>
              </div>
            </div>

            {adjustedCb && (
              <div className="glass-card rounded-2xl border border-white/70 bg-white/95 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Adjusted CB</p>
                    <p className={`text-3xl font-bold mt-1 ${
                      adjustedValue > 0 ? 'text-green-600' : 'text-red-600'
                    }`} data-testid="adjusted-cb-value">
                      {formatMillions(adjustedValue || 0)}M
                    </p>
                    <p className="text-xs text-slate-500 mt-1">gCO₂eq</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <PiggyBank className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Banked Applied:</span>
                    <span className="font-semibold text-emerald-600">{formatSignedMillions(adjustedNet)}M</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {cb && (
            <div className="glass-card grid grid-cols-1 gap-4 rounded-2xl border border-white/70 bg-white/95 p-4 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">CB Before</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{formatMillions(cbValue)}M</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Applied</p>
                <p className={`mt-2 text-2xl font-semibold ${adjustedNet >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{formatSignedMillions(adjustedNet)}M</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">CB After</p>
                <p className={`mt-2 text-2xl font-semibold ${cbAfter >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{formatMillions(cbAfter)}M</p>
              </div>
            </div>
          )}

          {/* Banking Actions */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="glass-card rounded-2xl border border-white/70 bg-white/95 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Bank Surplus</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2">Amount (gCO₂eq)</Label>
                  <Input
                    type="number"
                    value={bankAmount}
                    onChange={(e) => setBankAmount(e.target.value)}
                    placeholder="Enter amount to bank"
                    className="rounded-2xl border-slate-200"
                    disabled={cbValue <= 0}
                    data-testid="bank-amount-input"
                  />
                </div>
                <Button
                  onClick={handleBankSurplus}
                  disabled={!bankAmount || cbValue <= 0}
                  className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 py-4 text-white shadow-[0_12px_30px_rgba(16,185,129,0.35)]"
                  data-testid="bank-surplus-btn"
                >
                  Bank Surplus
                </Button>
                {cbValue <= 0 && (
                  <p className="text-sm text-red-600">Cannot bank deficit balance</p>
                )}
              </div>
            </div>

            <div className="glass-card rounded-2xl border border-white/70 bg-white/95 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Apply Banked</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2">Amount (gCO₂eq)</Label>
                  <Input
                    type="number"
                    value={applyAmount}
                    onChange={(e) => setApplyAmount(e.target.value)}
                    placeholder="Enter amount to apply"
                    className="rounded-2xl border-slate-200"
                    data-testid="apply-amount-input"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2">Apply To Ship</Label>
                  <Input
                    type="text"
                    value={applyShipId}
                    onChange={(e) => setApplyShipId(e.target.value.toUpperCase())}
                    placeholder="R001"
                    className="rounded-2xl border-slate-200"
                  />
                </div>
                <Button
                  onClick={handleApplyBanked}
                  disabled={!applyAmount || !applyShipId}
                  className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 py-4 text-white shadow-[0_12px_30px_rgba(79,70,229,0.35)]"
                  data-testid="apply-banked-btn"
                >
                  Apply Banked
                </Button>
              </div>
            </div>
          </div>

          {/* Banking Records */}
          {bankingRecords.length > 0 && (
            <div className="glass-card overflow-hidden rounded-3xl border border-white/70 bg-white/95">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500">
                <h3 className="text-lg font-bold text-white">Banking Records</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500/80">
                      <th className="px-6 py-4">Ship ID</th>
                      <th className="px-6 py-4">Year</th>
                      <th className="px-6 py-4">Amount (gCO₂eq)</th>
                      <th className="px-6 py-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankingRecords.map((record, idx) => (
                      <tr
                        key={record.id}
                        className="border-t border-slate-100/70"
                        data-testid={`banking-record-${idx}`}
                      >
                        <td className="px-6 py-4 font-semibold text-slate-900">{record.shipId ?? record.ship_id}</td>
                        <td className="px-6 py-4 text-slate-600">{record.year}</td>
                        <td className={`px-6 py-4 font-semibold ${Number(record.amount ?? record.amountGco2eq ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {formatSignedMillions(Number(record.amount ?? record.amountGco2eq ?? record.amount_gco2eq ?? 0))}M
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {record.timestamp || record.createdAt ? new Date(record.timestamp || record.createdAt).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BankingTab;
