import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

export default function Statistics() {
  // Fetch performance statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/stats/performance'],
  });

  // Format the average time to approval
  const formatTime = (hours: number) => {
    if (isNaN(hours) || hours === 0) return "N/A";
    
    const roundedHours = Math.floor(hours);
    const minutes = Math.round((hours - roundedHours) * 60);
    
    if (roundedHours === 0) {
      return `${minutes} min`;
    } else if (minutes === 0) {
      return `${roundedHours} hr`;
    } else {
      return `${roundedHours} hr ${minutes} min`;
    }
  };

  // Colors for charts
  const COLORS = [
    "#5865F2", // Discord blue
    "#57F287", // Discord green
    "#FEE75C", // Discord yellow
    "#ED4245", // Discord red
    "#EB459E", // Discord pink
  ];

  // Create data for ping usage chart
  const getPingUsageData = () => {
    if (!stats) return [];
    
    return [
      { name: "@everyone", value: stats.pingUsageStats.everyone },
      { name: "@here", value: stats.pingUsageStats.here },
      { name: "Other", value: stats.pingUsageStats.other },
    ];
  };

  // Create data for status chart
  const getStatusData = () => {
    if (!stats) return [];
    
    return [
      { name: "Completed", value: stats.completedGiveaways },
      { name: "Pending", value: stats.pendingGiveaways },
      { name: "Denied", value: stats.deniedGiveaways },
    ];
  };

  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Giveaway Performance Statistics</h1>
      
      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#5865F2] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-[#DCDDDE]">Loading statistics...</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#2D3136] border-gray-700 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#DCDDDE] text-lg">Total Giveaways</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats?.totalGiveaways || 0}</div>
                <p className="text-sm text-[#8E9297] mt-1">All-time giveaway requests</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#2D3136] border-gray-700 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#DCDDDE] text-lg">Average Approval Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {formatTime(stats?.averageTimeToApproval || 0)}
                </div>
                <p className="text-sm text-[#8E9297] mt-1">From request to approval</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#2D3136] border-gray-700 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#DCDDDE] text-lg">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {stats?.totalGiveaways 
                    ? Math.round((stats.completedGiveaways / stats.totalGiveaways) * 100) 
                    : 0}%
                </div>
                <p className="text-sm text-[#8E9297] mt-1">Successfully completed giveaways</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#2D3136] border-gray-700 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#DCDDDE] text-lg">Average Server Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {stats ? formatNumber(stats.averageServerSize) : 0}
                </div>
                <p className="text-sm text-[#8E9297] mt-1">Members per partnered server</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Giveaways Chart */}
            <Card className="bg-[#2D3136] border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#DCDDDE]">Monthly Giveaways</CardTitle>
                <CardDescription className="text-[#8E9297]">
                  Number of giveaways per month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats?.monthlyGiveaways || []}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#8E9297"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis stroke="#8E9297" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#36393F', borderColor: '#444', color: '#DCDDDE' }}
                        labelStyle={{ color: '#DCDDDE' }}
                      />
                      <Bar dataKey="count" fill="#5865F2" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Popular Servers */}
            <Card className="bg-[#2D3136] border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#DCDDDE]">Top Partnered Servers</CardTitle>
                <CardDescription className="text-[#8E9297]">
                  Most frequent giveaway partners
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={stats?.popularServers || []}
                      margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis type="number" stroke="#8E9297" />
                      <YAxis 
                        dataKey="serverName" 
                        type="category" 
                        stroke="#8E9297"
                        width={70}
                        tickFormatter={(value) => 
                          value.length > 15 ? value.substring(0, 15) + '...' : value
                        }
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#36393F', borderColor: '#444', color: '#DCDDDE' }}
                        labelStyle={{ color: '#DCDDDE' }}
                      />
                      <Bar dataKey="count" fill="#57F287" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Pie Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ping Usage */}
            <Card className="bg-[#2D3136] border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#DCDDDE]">Ping Usage Distribution</CardTitle>
                <CardDescription className="text-[#8E9297]">
                  Types of pings used in giveaways
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getPingUsageData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getPingUsageData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#36393F', borderColor: '#444', color: '#DCDDDE' }}
                        labelStyle={{ color: '#DCDDDE' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Status Distribution */}
            <Card className="bg-[#2D3136] border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#DCDDDE]">Giveaway Status Distribution</CardTitle>
                <CardDescription className="text-[#8E9297]">
                  Breakdown of giveaway outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getStatusData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#36393F', borderColor: '#444', color: '#DCDDDE' }}
                        labelStyle={{ color: '#DCDDDE' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}