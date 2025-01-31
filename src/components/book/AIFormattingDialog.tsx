import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wand2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

interface AIFormattingDialogProps {
  onConfigSubmit: (config: FormattingConfig) => void;
  disabled?: boolean;
  onConfigSelect?: (value: string) => void;
  selectedConfig?: string;
}

interface FormattingConfig {
  style: string;
  format: string;
  fontSize: number;
  lineSpacing: number;
  preserveIndentation: boolean;
  pageBreaks: 'auto' | 'preserve';
  headerFooter: boolean;
}

export function AIFormattingDialog({ onConfigSubmit, disabled, onConfigSelect, selectedConfig }: AIFormattingDialogProps) {
  const session = useSession();
  const [config, setConfig] = useState<FormattingConfig>({
    style: 'professional',
    format: 'standard',
    fontSize: 12,
    lineSpacing: 1.5,
    preserveIndentation: true,
    pageBreaks: 'auto',
    headerFooter: true
  });

  const { data: configurations = [] } = useQuery({
    queryKey: ["aiConfigurations", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from("ai_configurations")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const handleSubmit = () => {
    onConfigSubmit(config);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2"
          disabled={disabled}
        >
          <Wand2 className="h-4 w-4" />
          Format
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Formatting Assistant</DialogTitle>
          <DialogDescription>
            Configure how you want your document to be formatted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Configuration</Label>
            <Select
              value={selectedConfig}
              onValueChange={onConfigSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select configuration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Create New Configuration</SelectItem>
                {configurations.map((config) => (
                  <SelectItem key={config.id} value={config.id}>
                    {config.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Style</Label>
            <Select 
              value={config.style}
              onValueChange={(value) => setConfig(prev => ({ ...prev, style: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="manuscript">Manuscript</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <Select 
              value={config.format}
              onValueChange={(value) => setConfig(prev => ({ ...prev, format: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="ebook">E-book</SelectItem>
                <SelectItem value="paperback">Paperback</SelectItem>
                <SelectItem value="manuscript">Manuscript</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Font Size ({config.fontSize}pt)</Label>
            <Slider
              value={[config.fontSize]}
              onValueChange={([value]) => setConfig(prev => ({ ...prev, fontSize: value }))}
              min={8}
              max={16}
              step={0.5}
            />
          </div>

          <div className="space-y-2">
            <Label>Line Spacing ({config.lineSpacing})</Label>
            <Slider
              value={[config.lineSpacing]}
              onValueChange={([value]) => setConfig(prev => ({ ...prev, lineSpacing: value }))}
              min={1}
              max={2.5}
              step={0.1}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Preserve Indentation</Label>
            <Switch
              checked={config.preserveIndentation}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, preserveIndentation: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Page Breaks</Label>
            <Select 
              value={config.pageBreaks}
              onValueChange={(value: 'auto' | 'preserve') => setConfig(prev => ({ ...prev, pageBreaks: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Handle page breaks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Automatic</SelectItem>
                <SelectItem value="preserve">Preserve Existing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Include Header/Footer</Label>
            <Switch
              checked={config.headerFooter}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, headerFooter: checked }))}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit}>
            Start Formatting
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}