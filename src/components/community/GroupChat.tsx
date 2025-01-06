import { useState, useEffect, useRef } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { MessageList } from "./chat/MessageList";
import { MessageInput } from "./chat/MessageInput";
import { GroupHeader } from "./chat/GroupHeader";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface GroupChatProps {
  group: any;
  onBack: () => void;
}

export const GroupChat = ({ group, onBack }: GroupChatProps) => {
  const session = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    checkMembership();
    fetchMessages();
    setupRealtimeSubscription();
    
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [group.id]);

  const checkMembership = async () => {
    try {
      if (!session?.user?.id) {
        setIsMember(false);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("group_members")
        .select()
        .eq("group_id", group.id)
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        console.error("Error checking membership:", error);
        setIsMember(false);
      } else {
        setIsMember(!!data);
      }
    } catch (error) {
      console.error("Error checking membership:", error);
      setIsMember(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("group_messages")
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq("group_id", group.id)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`group_${group.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${group.id}`,
        },
        async (payload) => {
          const { data: messageWithProfile } = await supabase
            .from("group_messages")
            .select(`
              *,
              profiles:user_id (
                username,
                avatar_url
              )
            `)
            .eq("id", payload.new.id)
            .single();

          if (messageWithProfile) {
            setMessages((current) => [...current, messageWithProfile]);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
  };

  const handleSendMessage = async (content: string) => {
    if (!session?.user?.id || !isMember) return;
    
    try {
      const { error } = await supabase.from("group_messages").insert({
        content,
        group_id: group.id,
        user_id: session.user.id,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isMember) {
    return (
      <div className="p-4">
        <button onClick={onBack} className="mb-4">
          ← Back
        </button>
        <div className="text-center py-8">
          <p>You are not a member of this group.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <GroupHeader group={group} onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};