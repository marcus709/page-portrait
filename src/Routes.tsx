import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Community from "./pages/Community";
import InvitePage from "./pages/InvitePage";
import { Header } from "./components/Header";
import Dashboard from "./pages/Dashboard";
import { ProfileSettings } from "./pages/ProfileSettings";
import { CharactersView } from "./components/CharactersView";
import { FormattingView } from "./components/FormattingView";
import { StoryDocsView } from "./components/docs/StoryDocsView";
import { CommunityFeed } from "./components/community/CommunityFeed";
import { CommunityHome } from "./components/community/CommunityHome";
import Pricing from "./pages/Pricing";
import PricingPreview from "./pages/PricingPreview";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppLayout>
            <Index />
          </AppLayout>
        }
      />
      <Route
        path="/dashboard/*"
        element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        }
      >
        <Route path="characters" element={<CharactersView />} />
        <Route path="formatting" element={<FormattingView />} />
        <Route path="docs" element={<StoryDocsView />} />
      </Route>
      <Route
        path="/community/*"
        element={
          <AppLayout>
            <Community />
          </AppLayout>
        }
      >
        <Route path="" element={<CommunityFeed />} />
        <Route path="home" element={<CommunityHome />} />
      </Route>
      <Route
        path="/invite/:inviteId"
        element={
          <AppLayout>
            <InvitePage />
          </AppLayout>
        }
      />
      <Route
        path="/profile/settings"
        element={
          <AppLayout>
            <ProfileSettings />
          </AppLayout>
        }
      />
      <Route
        path="/pricing"
        element={
          <AppLayout>
            <Pricing />
          </AppLayout>
        }
      />
      <Route
        path="/pricing-preview"
        element={
          <AppLayout>
            <PricingPreview />
          </AppLayout>
        }
      />
    </Routes>
  );
}