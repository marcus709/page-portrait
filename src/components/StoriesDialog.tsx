import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { useStory } from "@/contexts/StoryContext";
import { useQueryClient } from "@tanstack/react-query";
import { CreateStoryForm } from "./stories/CreateStoryForm";
import { StoriesDialogHeader } from "./stories/StoriesDialogHeader";
import { StoriesGrid } from "./stories/StoriesGrid";
import { ScrollArea } from "./ui/scroll-area";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { useCreateStory, CreateStoryInput } from "@/hooks/useCreateStory";
import { Story } from "@/types/story";
import { supabase } from "@/integrations/supabase/client";

export function StoriesDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showNewStory, setShowNewStory] = React.useState(false);
  const [newStory, setNewStory] = useState<{ title: string; description: string }>({
    title: "",
    description: "",
  });
  
  const { selectedStory, setSelectedStory } = useStory();
  const queryClient = useQueryClient();
  const createStoryMutation = useCreateStory((story: Story) => {
    setSelectedStory(story);
    setShowNewStory(false);
    setNewStory({ title: "", description: "" });
  });

  useEffect(() => {
    if (isOpen) {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    }
  }, [isOpen, queryClient]);

  const handleCreateStory = async () => {
    if (!newStory.title.trim()) {
      return;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User must be logged in to create a story");
    }

    const storyInput: CreateStoryInput = {
      title: newStory.title,
      description: newStory.description,
      user_id: user.id,
    };

    createStoryMutation.mutate(storyInput);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <StoriesDialogHeader onClose={() => setIsOpen(false)} />

          <Button
            onClick={() => {
              setIsOpen(false);
              setShowNewStory(true);
            }}
            variant="outline"
            className="w-full border-dashed border-2 py-8 mb-6 hover:border-purple-500 hover:text-purple-500 group"
            disabled={createStoryMutation.isPending}
          >
            <Plus className="mr-2 h-4 w-4 group-hover:text-purple-500" />
            Create New Story
          </Button>

          <ScrollArea className="h-[400px] pr-4">
            {createStoryMutation.isPending ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
              </div>
            ) : (
              <StoriesGrid
                stories={stories || []}
                onStorySelect={(story) => {
                  setSelectedStory(story);
                  setIsOpen(false);
                }}
                onClose={() => setIsOpen(false)}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewStory} onOpenChange={setShowNewStory}>
        <DialogContent className="sm:max-w-[500px]">
          <StoriesDialogHeader onClose={() => setShowNewStory(false)} />

          <CreateStoryForm
            newStory={newStory}
            onClose={() => {
              setShowNewStory(false);
              setNewStory({ title: "", description: "" });
            }}
            onChange={(field, value) => setNewStory(prev => ({ ...prev, [field]: value }))}
            onSubmit={handleCreateStory}
            isLoading={createStoryMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}