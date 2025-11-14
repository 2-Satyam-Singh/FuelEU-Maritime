import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { Users, Plus, Trash2, CheckCircle, XCircle, RefreshCw } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
const API = BACKEND_URL;

const PoolingTab = () => {
  const [year, setYear] = useState(2024);
  const [members, setMembers] = useState([]);
  const [loadingAdjusted, setLoadingAdjusted] = useState(false);
  const [poolResult, setPoolResult] = useState(null);

  const formatMillions = (value = 0) => (Number(value || 0) / 1000000).toFixed(2);
  const formatSignedMillions = (value = 0) => `${value >= 0 ? '+' : '-'}${formatMillions(Math.abs(value))}`;

  const addMember = () => {
    setMembers([...members, { shipId: "", cbBefore: 0 }]);
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = field === "cbBefore" ? parseFloat(value) : value;
    setMembers(updated);
  };

  const totalCB = members.reduce((sum, m) => sum + (m.cbBefore || 0), 0);
  const isValidPool = totalCB >= 0;

  const createPool = async () => {
    try {
      const response = await axios.post(`${API}/pools`, {
        year,
        members
      });
      setPoolResult(response.data);
      toast.success("Pool created successfully");
    } catch (error) {
      console.error("Error creating pool:", error);
      toast.error(error.response?.data?.error || "Failed to create pool");
    }
  };

  const hydrateMembers = async (targetYear = year) => {
    try {
      setLoadingAdjusted(true);
      const { data } = await axios.get(`${API}/compliance/adjusted-cb?year=${targetYear}`);
      if (Array.isArray(data) && data.length) {
        setMembers(
          data.map((item) => ({
            shipId: item.shipId,
            cbBefore: Number(item.adjustedCb ?? item.cbGco2eq ?? 0) 
          }))
        );
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error("Error fetching adjusted CB list", error);
      toast.error(error.response?.data?.error || "Failed to load adjusted CBs");
    } finally {
      setLoadingAdjusted(false);
    }
  };

  useEffect(() => {
    hydrateMembers(year);
  }, [year]);

  return (
    <div className="space-y-6" data-testid="pooling-tab-content">
      <div className="glass-card rounded-3xl border border-white/70 bg-white/95 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">Pooling</p>
            <h2 className="text-xl font-semibold text-slate-900">Pool Configuration</h2>
          </div>
        </div>

        <div className="mb-6 max-w-xs">
          <Label className="text-sm font-medium text-slate-600">Year</Label>
          <Input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="mt-2 rounded-2xl border-slate-200"
            data-testid="pool-year-input"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => hydrateMembers(year)}
          disabled={loadingAdjusted}
          className="mb-4 inline-flex items-center gap-2 rounded-full border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loadingAdjusted ? 'animate-spin' : ''}`} />
          Sync Adjusted CBs
        </Button>

        {/* Pool Summary */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">Total Pool CB</p>
            <p
              className={`mt-2 text-3xl font-semibold ${isValidPool ? 'text-emerald-600' : 'text-rose-600'}`}
              data-testid="total-pool-cb"
            >
              {`${formatSignedMillions(totalCB)}M`} gCO₂eq
            </p>
          </div>
          <div>
            {isValidPool ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600">
                <CheckCircle className="w-4 h-4" /> Valid Pool
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600">
                <XCircle className="w-4 h-4" /> Invalid Pool
              </div>
            )}
          </div>
        </div>

        {/* Members */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-slate-700">Pool Members</Label>
            <Button
              onClick={addMember}
              size="sm"
              className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-4 text-white"
              data-testid="add-member-btn"
            >
              <Plus className="mr-1 h-4 w-4" /> Add Member
            </Button>
          </div>

          {members.map((member, index) => (
            <div
              key={index}
              className="glass-card flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/95 p-4 sm:flex-row"
              data-testid={`member-${index}`}
            >
              <div className="flex-1">
                <Label className="text-xs font-medium text-slate-500">Ship ID</Label>
                <Input
                  type="text"
                  value={member.shipId}
                  onChange={(e) => updateMember(index, "shipId", e.target.value)}
                  placeholder="SHIP_001"
                  className="mt-2 rounded-2xl border-slate-200"
                  data-testid={`member-ship-id-${index}`}
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs font-medium text-slate-500">CB Before (gCO₂eq)</Label>
                <Input
                  type="number"
                  value={member.cbBefore}
                  onChange={(e) => updateMember(index, "cbBefore", e.target.value)}
                  placeholder="0"
                  className="mt-2 rounded-2xl border-slate-200"
                  data-testid={`member-cb-before-${index}`}
                />
              </div>
              <Button
                onClick={() => removeMember(index)}
                size="icon"
                variant="destructive"
                className="self-start rounded-2xl"
                data-testid={`remove-member-${index}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          onClick={createPool}
          disabled={!isValidPool || members.some((m) => !m.shipId)}
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 py-4 text-white shadow-[0_18px_35px_rgba(79,70,229,0.35)]"
          data-testid="create-pool-btn"
        >
          Create Pool
        </Button>
      </div>

      {/* Pool Result */}
      {poolResult && (
        <div className="glass-card overflow-hidden rounded-3xl border border-white/70 bg-white/95">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500">
            <h3 className="text-lg font-bold text-white">Pool Allocation Result</h3>
            <p className="text-sm text-white/70">Year: {poolResult.year}</p>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500/80">
                    <th className="px-6 py-4">Ship ID</th>
                    <th className="px-6 py-4">CB Before</th>
                    <th className="px-6 py-4 text-center">Transfer</th>
                    <th className="px-6 py-4">CB After</th>
                  </tr>
                </thead>
                <tbody>
                  {poolResult.members.map((member, idx) => (
                    <tr key={idx} className="border-t border-slate-100/70" data-testid={`pool-result-${idx}`}>
                      <td className="px-6 py-4 font-semibold text-slate-900">{member.shipId ?? member.ship_id}</td>
                      <td
                        className={`px-6 py-4 font-semibold ${
                          (member.cbBefore ?? member.cb_before) >= 0 ? 'text-emerald-600' : 'text-rose-500'
                        }`}
                      >
                        {formatMillions(member.cbBefore ?? member.cb_before)}M
                      </td>
                      <td className="px-6 py-4 text-center text-slate-400">
                        <span>→</span>
                      </td>
                      <td
                        className={`px-6 py-4 font-semibold ${
                          (member.cbAfter ?? member.cb_after) >= 0 ? 'text-emerald-600' : 'text-rose-500'
                        }`}
                      >
                        {formatMillions(member.cbAfter ?? member.cb_after)}M
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoolingTab;
