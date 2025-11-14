import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

import RoutesTab from "../components/tabs/RoutesTab";
import CompareTab from "../components/tabs/CompareTab";
import BankingTab from "../components/tabs/BankingTab";
import PoolingTab from "../components/tabs/PoolingTab";
import { Ship, BarChart3, Wallet, Users } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="dashboard-shell min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/40 to-white pb-16">
      <div className="mx-auto max-w-6xl px-4 pt-10 space-y-10 sm:px-6">
        {/* Hero */}
        <header className="glass-card rounded-3xl border border-white/60 bg-white px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 shadow-lg">
                <Ship className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[1000000 cm] text-slate-40000">Fuel EU</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" data-testid="dashboard-title">Fuel EU Compliance Dashboard</h1>
                <p className="text-sm text-slate-500">Maritime Emissions Monitoring &amp; Management</p>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <Tabs defaultValue="routes" className="space-y-6">
          <TabsList className="tab-rail grid grid-cols-1 gap-3 rounded-[999px] border border-slate-100 bg-white/90 p-2 sm:grid-cols-4">
            <TabsTrigger
              value="routes"
              className="flex items-center justify-center gap-2 rounded-full px-6 py-2 text-sm font-semibold text-slate-500 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
              data-testid="routes-tab"
            >
              <Ship className="w-4 h-4" />
              Routes
            </TabsTrigger>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <TabsTrigger
              value="compare"
              className="flex items-center justify-center gap-2 rounded-full px-6 py-2 text-sm font-semibold text-slate-500 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
              data-testid="compare-tab"
            >
              <BarChart3 className="w-4 h-4" />
              Compare
            </TabsTrigger>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <TabsTrigger
              value="banking"
              className="flex items-center justify-center gap-2 rounded-full px-6 py-2 text-sm font-semibold text-slate-500 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
              data-testid="banking-tab"
            >
              <Wallet className="w-4 h-4" />
              Banking
            </TabsTrigger>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <TabsTrigger
              value="pooling"
              className="flex items-center justify-center gap-2 rounded-full px-6 py-2 text-sm font-semibold text-slate-500 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
              data-testid="pooling-tab"
            >
              <Users className="w-4 h-4" />
              Pooling
            </TabsTrigger>
          </TabsList>

          <TabsContent value="routes">
            <RoutesTab />
          </TabsContent>
          <TabsContent value="compare">
            <CompareTab />
          </TabsContent>
          <TabsContent value="banking">
            <BankingTab />
          </TabsContent>
          <TabsContent value="pooling">
            <PoolingTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
