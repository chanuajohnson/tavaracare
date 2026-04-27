import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Image, File, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssetCardProps {
  title: string;
  description: string;
  previewImage?: string;
  downloadFormat: 'PDF' | 'ZIP' | 'PNG' | 'JPG' | 'TXT' | 'HTML';
  fileSize?: string;
  assetType: string;
  downloadUrl?: string;
  onDownload: (assetType: string, downloadUrl: string) => void;
  hasAccess: boolean;
  className?: string;
}

const formatIcons = {
  PDF: FileText,
  ZIP: File,
  PNG: Image,
  JPG: Image,
  TXT: FileText,
  HTML: FileText,
};

export const AssetCard: React.FC<AssetCardProps> = ({
  title,
  description,
  previewImage,
  downloadFormat,
  fileSize,
  assetType,
  downloadUrl = '#',
  onDownload,
  hasAccess,
  className
}) => {
  const FormatIcon = formatIcons[downloadFormat] || File;

  const handleDownloadClick = () => {
    onDownload(assetType, downloadUrl);
  };

  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-300", className)}>
      <CardHeader className="space-y-3">
        {/* Preview or Icon */}
        <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
          {previewImage ? (
            <img 
              src={previewImage} 
              alt={title}
              className={cn(
                "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
                !hasAccess && "blur-sm"
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FormatIcon className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
          
          {!hasAccess && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Format Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
            <FormatIcon className="h-3 w-3" />
            {downloadFormat}
          </span>
          {fileSize && (
            <span className="text-xs text-muted-foreground">
              {fileSize}
            </span>
          )}
        </div>

        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="mt-1">{description}</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <Button 
          onClick={handleDownloadClick}
          className="w-full gap-2"
          variant={hasAccess ? "default" : "outline"}
        >
          {hasAccess ? (
            <>
              <Download className="h-4 w-4" />
              Download {downloadFormat}
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Unlock to Download
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
