
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ChatConfig } from "@/utils/chat/chatFlowEngine";
import { loadChatConfig, saveChatConfig } from "@/utils/chat/chatConfig";
import { toast } from "sonner";

interface ChatSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChatSettings: React.FC<ChatSettingsProps> = ({ 
  open,
  onOpenChange
}) => {
  const [config, setConfig] = useState<ChatConfig>(loadChatConfig());
  
  const handleSave = () => {
    saveChatConfig(config);
    toast.success("Chat settings saved");
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chat Settings</DialogTitle>
          <DialogDescription>
            Configure how the Tavara chat assistant behaves.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="mode">Chat Mode</Label>
            <Select
              value={config.mode}
              onValueChange={(value) => setConfig({...config, mode: value as 'ai' | 'scripted' | 'hybrid'})}
            >
              <SelectTrigger id="mode">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ai">AI Only</SelectItem>
                <SelectItem value="scripted">Scripted Only</SelectItem>
                <SelectItem value="hybrid">Hybrid (AI with fallback)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {config.mode === 'ai' && "Uses only AI responses for all messages."}
              {config.mode === 'scripted' && "Uses only pre-defined scripted messages."}
              {config.mode === 'hybrid' && "Uses AI with fallback to scripted if AI fails."}
            </p>
          </div>
          
          {config.mode !== 'scripted' && (
            <div className="grid gap-2">
              <Label htmlFor="temperature">Temperature: {config.temperature}</Label>
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.1}
                value={[config.temperature || 0.7]}
                onValueChange={(values) => setConfig({...config, temperature: values[0]})}
              />
              <p className="text-sm text-muted-foreground">
                Lower values make responses more focused and deterministic. Higher values make responses more creative and varied.
              </p>
            </div>
          )}
          
          {config.mode === 'hybrid' && (
            <div className="grid gap-2">
              <Label htmlFor="fallbackThreshold">Fallback Threshold: {config.fallbackThreshold}</Label>
              <Slider
                id="fallbackThreshold"
                min={1}
                max={5}
                step={1}
                value={[config.fallbackThreshold || 2]}
                onValueChange={(values) => setConfig({...config, fallbackThreshold: values[0]})}
              />
              <p className="text-sm text-muted-foreground">
                Number of AI failures before falling back to scripted messages.
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <Label htmlFor="trinidadian-style">Trinidad & Tobago Style</Label>
            <Switch 
              id="trinidadian-style" 
              checked={true}
              disabled={true}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
