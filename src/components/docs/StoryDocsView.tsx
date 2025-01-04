import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStory } from "@/contexts/StoryContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { CreateDocumentDialog } from "./CreateDocumentDialog";
import { DocumentEditor } from "./DocumentEditor";
import { DocumentSidebar } from "./DocumentSidebar";
import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export const StoryDocsView = () => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { selectedStory } = useStory();
  const { toast } = useToast();

  const { data: documents = [], refetch: refetchDocs } = useQuery({
    queryKey: ["documents", selectedStory?.id],
    queryFn: async () => {
      if (!selectedStory) return [];
      
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("story_id", selectedStory.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch documents",
          variant: "destructive",
        });
        return [];
      }

      // Auto-select the first document if none is selected
      if (data.length > 0 && !selectedDocId) {
        setSelectedDocId(data[0].id);
      }

      return data;
    },
    enabled: !!selectedStory?.id,
  });

  if (!selectedStory) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] text-gray-500">
        Please select a story to view documents
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex items-center justify-between px-8 py-4 border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Story Documents</h1>
          <p className="text-gray-500">Write and organize your story content</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Document
        </Button>
      </div>

      <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-12rem)]">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
          <DocumentSidebar onContentDrop={(content) => {}} />
        </ResizablePanel>
        
        <ResizablePanel defaultSize={80}>
          {selectedDocId ? (
            <DocumentEditor documentId={selectedDocId} onRefresh={refetchDocs} />
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 bg-gray-50 text-gray-500">
              <FileText className="w-12 h-12 mb-4" />
              <p>Select a document to start editing</p>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>

      <CreateDocumentDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onDocumentCreated={() => {
          refetchDocs();
          setIsCreateDialogOpen(false);
        }}
      />
    </div>
  );
};