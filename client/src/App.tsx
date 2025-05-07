import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import UserProfile from "@/components/layout/user-profile";
import { UserProvider } from "@/contexts/UserContext";
import { ProtectedRoute } from "@/components/auth/protected-route";

import Dashboard from "@/pages/dashboard";
import PendingGiveaways from "@/pages/pending-giveaways";
import Schedule from "@/pages/schedule";
import InviteTracking from "@/pages/invite-tracking";
import Commands from "@/pages/commands";
import Settings from "@/pages/settings";
import Statistics from "@/pages/statistics";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import DiscordDebug from "@/pages/discord-debug";

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex bg-[#36393F] text-[#DCDDDE] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center">
          <Header />
          <div className="p-2 mr-2 z-10">
            <UserProfile />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-6 discord-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const isLoginPage = location === "/login";
  const isDebugPage = location === "/discord-debug";

  if (isLoginPage) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
      </Switch>
    );
  }
  
  if (isDebugPage) {
    return (
      <Switch>
        <Route path="/discord-debug" component={DiscordDebug} />
      </Switch>
    );
  }

  return (
    <MainLayout>
      <Switch>
        <Route path="/">
          {() => (
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/pending-giveaways">
          {() => (
            <ProtectedRoute>
              <PendingGiveaways />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/schedule">
          {() => (
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/invite-tracking">
          {() => (
            <ProtectedRoute>
              <InviteTracking />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/commands">
          {() => (
            <ProtectedRoute>
              <Commands />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/statistics">
          {() => (
            <ProtectedRoute>
              <Statistics />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/settings">
          {() => (
            <ProtectedRoute adminOnly>
              <Settings />
            </ProtectedRoute>
          )}
        </Route>
        <Route>
          {() => (
            <ProtectedRoute>
              <NotFound />
            </ProtectedRoute>
          )}
        </Route>
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <Toaster />
          <Router />
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
