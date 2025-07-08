
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Copy, CheckCircle, MessageSquare } from "lucide-react";
import { WhatsAppMessage, copyToClipboard, openWhatsAppURLsWithDelay } from "@/utils/whatsapp/whatsappWebUtils";
import { toast } from "sonner";

interface WhatsAppMessagePreviewProps {
  messages: WhatsAppMessage[];
  onMarkAsSent?: (contactIds: string[]) => void;
}

export const WhatsAppMessagePreview: React.FC<WhatsAppMessagePreviewProps> = ({
  messages,
  onMarkAsSent
}) => {
  const [sentMessages, setSentMessages] = useState<Set<string>>(new Set());
  const [openingAll, setOpeningAll] = useState(false);

  const handleCopyMessage = async (message: string) => {
    const success = await copyToClipboard(message);
    if (success) {
      toast.success('Message copied to clipboard');
    } else {
      toast.error('Failed to copy message');
    }
  };

  const handleCopyURL = async (url: string) => {
    const success = await copyToClipboard(url);
    if (success) {
      toast.success('WhatsApp URL copied to clipboard');
    } else {
      toast.error('Failed to copy URL');
    }
  };

  const handleOpenSingle = (url: string, contactId: string) => {
    window.open(url, '_blank');
    setSentMessages(prev => new Set([...prev, contactId]));
  };

  const handleOpenAll = async () => {
    if (messages.length === 0) return;
    
    setOpeningAll(true);
    try {
      const urls = messages.map(msg => msg.url);
      await openWhatsAppURLsWithDelay(urls, 1000); // 1 second delay between opens
      
      // Mark all as sent
      const contactIds = messages.map(msg => msg.contact.id);
      setSentMessages(prev => new Set([...prev, ...contactIds]));
      
      toast.success(`Opened ${messages.length} WhatsApp conversations`);
      
      // Notify parent component
      if (onMarkAsSent) {
        onMarkAsSent(contactIds);
      }
    } catch (error) {
      toast.error('Failed to open WhatsApp conversations');
    } finally {
      setOpeningAll(false);
    }
  };

  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No contacts with phone numbers found
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with bulk actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">WhatsApp Messages Ready</h3>
          <p className="text-sm text-muted-foreground">
            {messages.length} message{messages.length === 1 ? '' : 's'} generated
          </p>
        </div>
        <Button 
          onClick={handleOpenAll}
          disabled={openingAll || messages.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          {openingAll ? 'Opening...' : `Open All (${messages.length})`}
        </Button>
      </div>

      {/* Individual message cards */}
      <div className="space-y-3">
        {messages.map((msgData) => {
          const isSent = sentMessages.has(msgData.contact.id);
          
          return (
            <Card key={msgData.contact.id} className={isSent ? 'border-green-200 bg-green-50' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {msgData.contact.name}
                      {isSent && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Sent
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {msgData.contact.phone} • {msgData.contact.role || 'Team Member'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyMessage(msgData.message)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleOpenSingle(msgData.url, msgData.contact.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Send via WhatsApp
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 border rounded-lg p-3">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-900">
                    {msgData.message}
                  </pre>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyURL(msgData.url)}
                    className="text-xs"
                  >
                    Copy WhatsApp URL
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="font-medium mb-1">How it works:</p>
        <ul className="space-y-1">
          <li>• Click "Send via WhatsApp" to open the conversation in a new tab</li>
          <li>• Review the message before sending it manually</li>
          <li>• Messages open with 1-second delays to prevent browser blocking</li>
          <li>• You can copy messages or URLs to clipboard for later use</li>
        </ul>
      </div>
    </div>
  );
};
