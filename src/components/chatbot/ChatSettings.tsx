
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { loadChatConfig, saveChatConfig, getChatModeName } from "@/utils/chat/chatConfig";
import { ChatConfig } from '@/utils/chat/chatFlowEngine';
import { toast } from 'sonner';

interface ChatSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChatSettings: React.FC<ChatSettingsProps> = ({
  open,
  onOpenChange,
}) => {
  // Load config from localStorage
  const [config, setConfig] = useState<ChatConfig>(() => loadChatConfig());
  const [alwaysShowOptions, setAlwaysShowOptions] = useState<boolean>(
    localStorage.getItem('tavara_chat_always_show_options') === 'true'
  );

  const handleSave = () => {
    saveChatConfig(config);
    localStorage.setItem('tavara_chat_always_show_options', alwaysShowOptions.toString());
    onOpenChange(false);
    toast.success("Chat settings saved");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chat Settings</DialogTitle>
          <DialogDescription>
            Configure how the chat assistant behaves
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="mode">Chat Mode</Label>
            <Select
              value={config.mode}
              onValueChange={(value) => setConfig({ ...config, mode: value as 'ai' | 'scripted' | 'hybrid' })}
            >
              <SelectTrigger id="mode">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ai">AI Only</SelectItem>
                <SelectItem value="scripted">Scripted Only</SelectItem>
                <SelectItem value="hybrid">Hybrid (AI with Scripted Fallback)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {config.mode === 'ai' 
                ? "AI mode uses generative AI for more natural conversations"
                : config.mode === 'scripted'
                ? "Scripted mode uses pre-defined messages for consistent responses"
                : "Hybrid mode tries AI first, but falls back to scripted if needed"}
            </p>
          </div>

          {config.mode !== 'scripted' && (
            <div className="grid gap-2">
              <Label htmlFor="temperature">AI Temperature ({config.temperature})</Label>
              <Slider
                id="temperature"
                min={0.1}
                max={1.0}
                step={0.1}
                defaultValue={[config.temperature || 0.7]}
                onValueChange={(value) => setConfig({ ...config, temperature: value[0] })}
              />
              <p className="text-sm text-muted-foreground">
                Lower values make responses more predictable, higher values more creative
              </p>
            </div>
          )}

          {config.mode === 'hybrid' && (
            <div className="grid gap-2">
              <Label htmlFor="fallbackThreshold">Fallback Threshold</Label>
              <Select
                value={config.fallbackThreshold?.toString() || "2"}
                onValueChange={(value) => setConfig({ ...config, fallbackThreshold: parseInt(value) })}
              >
                <SelectTrigger id="fallbackThreshold">
                  <SelectValue placeholder="Select threshold" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 (Quick Fallback)</SelectItem>
                  <SelectItem value="2">2 (Default)</SelectItem>
                  <SelectItem value="3">3 (More AI Attempts)</SelectItem>
                  <SelectItem value="5">5 (Maximum AI Attempts)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                How many AI failures before falling back to scripted responses
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="always-show-options"
              checked={alwaysShowOptions}
              onCheckedChange={setAlwaysShowOptions}
            />
            <Label htmlFor="always-show-options">Always Show Multiple-Choice Options</Label>
          </div>
          <p className="text-sm text-muted-foreground mt-0">
            When enabled, chat will always provide clickable options instead of requiring free text input
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
