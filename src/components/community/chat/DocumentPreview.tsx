import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DocumentPreviewProps {
  document: {
    id: string;
    title: string;
    content: string;
  };
  isInMessage?: boolean;
}

export const DocumentPreview = ({ document, isInMessage }: DocumentPreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(document.content);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('documents')
        .update({ content })
        .eq('id', document.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document saved successfully",
      });
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Error",
        description: "Failed to save document",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className={`
          cursor-pointer p-3 rounded-lg transition-colors
          ${isInMessage 
            ? 'bg-gray-100/50 hover:bg-gray-200/50' 
            : 'bg-white border border-gray-200 hover:bg-gray-50'
          }
        `}
      >
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-violet-500" />
          <h4 className="font-medium text-sm text-gray-900">{document.title}</h4>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0">
          <div className="flex flex-col h-full bg-zinc-50">
            <DialogHeader className="px-6 py-4 border-b bg-white flex flex-row items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
                <FileText className="h-5 w-5 text-violet-500" />
                {document.title}
              </DialogTitle>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </DialogHeader>
            
            <div className="flex-1 overflow-hidden">
              <RichTextEditor 
                content={content} 
                onChange={setContent}
                className="bg-white rounded-none border-0"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};