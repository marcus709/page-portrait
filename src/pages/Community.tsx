import { MessageSquare, Users, Hash, Bookmark, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import { CommunityPost } from "@/components/community/CommunityPost";
import { CommunityTrendingTopics } from "@/components/community/CommunityTrendingTopics";
import { CommunitySidebar } from "@/components/community/CommunitySidebar";

export default function Community() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar */}
      <CommunitySidebar />

      {/* Main Content */}
      <main className="flex-1 border-x">
        <div className="max-w-3xl mx-auto py-6 px-4 mt-16">
          <CommunityFeed />
        </div>
      </main>

      {/* Right Sidebar */}
      <div className="w-80 p-6 mt-16">
        <CommunityTrendingTopics />
      </div>
    </div>
  );
}