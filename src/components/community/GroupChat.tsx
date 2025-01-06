import { useState, useEffect, useRef } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GroupHeader } from "./chat/GroupHeader";
import { MessageList } from "./chat/MessageList";
import { MessageInput } from "./chat/MessageInput";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { RealtimeChannel } from "@supabase/supabase-js";

interface GroupChatProps {
  group: any;
  onBack: () => void;
}

export const GroupChat = ({ group, onBack }: GroupChatProps) => {
  const session = useSession();
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
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
      if (!session?.user?.id) return;
      
      const { data, error } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", group.id)
        .eq("user_id", session.user.id)
        .single();

      if (error) throw error;
      setIsMember(!!data);
    } catch (error) {
      console.error("Error checking membership:", error);
      setIsMember(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!isMember) return;
    try {
      const { data, error } = await supabase
        .from("group_messages")
        .select(`
          *,
          profiles:profiles!group_messages_user_id_fkey_profiles (
            username,
            avatar_url
          )
        `)
        .eq("group_id", group.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const setupRealtimeSubscription = () => {
    if (!isMember) return;
    
    const channel = supabase
      .channel("group_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${group.id}`,
        },
        async (payload) => {
          // Fetch the profile information for the new message
          const { data: profileData } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", payload.new.user_id)
            .single();

          setMessages((current) => [
            ...current,
            { ...payload.new, profiles: profileData },
          ]);
        }
      )
      .subscribe();

    channelRef.current = channel;
    return channel;
  };

  const handleSendMessage = async (content: string) => {
    if (!isMember || !session?.user?.id) return;
    
    try {
      const { error } = await supabase.from("group_messages").insert({
        content,
        group_id: group.id,
        user_id: session.user.id,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">Loading...</div>;
  }

  if (!isMember) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] bg-background rounded-lg shadow-sm p-8">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive" className="border-destructive/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Restricted</AlertTitle>
            <AlertDescription className="mt-2">
              You need to be a member of this group to view and participate in the chat.
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button onClick={onBack} variant="outline" className="min-w-[120px]">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-lg shadow-sm">
      <GroupHeader groupName={group.name} onBack={onBack} />
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>
      <div className="sticky bottom-0 bg-white border-t p-4">
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};