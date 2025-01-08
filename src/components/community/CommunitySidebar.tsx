import { NavLink } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import { MessageSquare, Users, Hash, Bookmark, Settings, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddFriendsDialog } from "./AddFriendsDialog";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { capitalize } from "lodash";
import { FriendRequestsList } from "./FriendRequestsList";
import { FriendsList } from "./FriendsList";

const navItems = [
  { icon: MessageSquare, label: "Feed", href: "/community" },
  { icon: Users, label: "My Groups", href: "/community/groups", end: true },
  { icon: Hash, label: "Topics", href: "/community/topics" },
  { icon: Bookmark, label: "Saved", href: "/community/saved" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export const CommunitySidebar = () => {
  const session = useSession();
  const { plan } = useSubscription();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: friendRequests } = useQuery({
    queryKey: ["friend-requests", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friendships")
        .select("*")
        .eq("friend_id", session?.user?.id)
        .eq("status", "pending");

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const hasPendingRequests = friendRequests && friendRequests.length > 0;

  return (
    <div className="space-y-6">
      {profile && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-transparent transition-all duration-300 hover:from-purple-100">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-medium text-lg shadow-md">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              profile.username?.[0]?.toUpperCase() || "U"
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-gray-900 truncate">
              {profile.username || "Anonymous"}
            </span>
            <span className="text-sm text-gray-500 truncate">
              {plan !== 'free' ? `${capitalize(plan)} Plan` : "Free Plan"}
            </span>
          </div>
        </div>
      )}

      <nav className="space-y-1">
        {navItems.map(({ icon: Icon, label, href, end }) => (
          <NavLink
            key={href}
            to={href}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-purple-100 to-purple-50 text-purple-900 font-medium shadow-sm"
                  : "text-gray-600 hover:bg-purple-50/50 hover:text-gray-900"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
        <AddFriendsDialog>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 text-gray-600 hover:bg-purple-50/50 hover:text-gray-900 relative">
            <UserPlus className="h-5 w-5" />
            <span>Add Friends</span>
            {hasPendingRequests && (
              <span className="absolute top-2 left-6 h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            )}
          </button>
        </AddFriendsDialog>
      </nav>

      <FriendRequestsList />

      <div className="pt-4 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Friends</h3>
        <FriendsList />
      </div>
    </div>
  );
};