
import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, FileText, AlertCircle, CheckCircle } from "lucide-react";
import Papa from 'papaparse';

interface CSVUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groceryListId: string;
  onUploadComplete: (results: { success: number; errors: string[] }) => void;
}

interface CSVRow {
  Category: string;
  'Item Name': string;
  Brand?: string;
  Description?: string;
  Quantity?: string;
  'Size/Weight'?: string;
  'Estimated Price'?: string;
  'Store Section'?: string;
  Substitutes?: string;
  Notes?: string;
  'Urgency Level'?: string;
  'Preferred Store'?: string;
  Priority?: string;
}

export const CSVUploadDialog = ({ open, onOpenChange, groceryListId, onUploadComplete }: CSVUploadDialogProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CSVRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [stage, setStage] = useState<'upload' | 'preview' | 'processing' | 'complete'>('upload');

  const downloadTemplate = () => {
    const templateData = [
      {
        'Category': 'Food Goods',
        'Item Name': 'Rice',
        'Brand': 'Uncle Ben\'s',
        'Description': 'Jasmine',
        'Quantity': '2 bags',
        'Size/Weight': '5 lbs each',
        'Estimated Price': '8.99',
        'Store Section': 'Aisle 3',
        'Substitutes': 'Mahatma Rice',
        'Notes': 'For dinner parties',
        'Urgency Level': 'medium',
        'Preferred Store': 'SuperCenter',
        'Priority': '1'
      }
    ];

    const csv = Papa.unparse(templateData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'grocery_list_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
      setFile(droppedFile);
      parseCSV(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as CSVRow[];
        const filteredData = data.filter(row => 
          row['Item Name'] && row['Item Name'].trim() !== '' && row['Item Name'] !== '""'
        );
        setParsedData(filteredData);
        setStage('preview');
      },
      error: (error) => {
        setErrors([`CSV parsing error: ${error.message}`]);
      }
    });
  };

  const validateAndTransformData = (data: CSVRow[]) => {
    const transformedItems: any[] = [];
    const validationErrors: string[] = [];

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because of header and 0-based index

      // Required fields validation
      if (!row['Item Name'] || row['Item Name'].trim() === '' || row['Item Name'] === '""') {
        validationErrors.push(`Row ${rowNumber}: Item Name is required`);
        return;
      }

      if (!row.Category || row.Category.trim() === '' || row.Category === '""') {
        validationErrors.push(`Row ${rowNumber}: Category is required`);
        return;
      }

      // Clean empty values (handle "" pattern)
      const cleanValue = (value: string | undefined) => {
        if (!value || value.trim() === '' || value === '""') return undefined;
        return value.trim();
      };

      // Validate urgency level
      const urgencyLevel = cleanValue(row['Urgency Level']);
      const validUrgencyLevels = ['low', 'medium', 'high', 'urgent'];
      const finalUrgencyLevel = urgencyLevel && validUrgencyLevels.includes(urgencyLevel.toLowerCase()) 
        ? urgencyLevel.toLowerCase() 
        : 'medium';

      // Validate and parse price
      let estimatedPrice: number | undefined;
      const priceStr = cleanValue(row['Estimated Price']);
      if (priceStr) {
        const parsed = parseFloat(priceStr);
        if (!isNaN(parsed)) {
          estimatedPrice = parsed;
        }
      }

      // Validate and parse priority
      let priority = 1;
      const priorityStr = cleanValue(row.Priority);
      if (priorityStr) {
        const parsed = parseInt(priorityStr);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) {
          priority = parsed;
        }
      }

      transformedItems.push({
        grocery_list_id: groceryListId,
        category: row.Category.trim(),
        item_name: row['Item Name'].trim(),
        description: cleanValue(row.Description),
        brand: cleanValue(row.Brand),
        quantity: cleanValue(row.Quantity),
        size_weight: cleanValue(row['Size/Weight']),
        estimated_price: estimatedPrice,
        store_section: cleanValue(row['Store Section']),
        substitutes: cleanValue(row.Substitutes),
        notes: cleanValue(row.Notes),
        urgency_level: finalUrgencyLevel as 'low' | 'medium' | 'high' | 'urgent',
        preferred_store: cleanValue(row['Preferred Store']),
        priority
      });
    });

    return { items: transformedItems, errors: validationErrors };
  };

  const processUpload = async () => {
    setIsProcessing(true);
    setStage('processing');
    setProgress(0);

    const { items, errors: validationErrors } = validateAndTransformData(parsedData);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsProcessing(false);
      return;
    }

    // Process in chunks of 50 items
    const chunkSize = 50;
    const chunks = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      chunks.push(items.slice(i, i + chunkSize));
    }

    let successCount = 0;
    const processingErrors: string[] = [];

    try {
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        // Simulate API call - you'll need to implement bulk insert in your service
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time
        
        successCount += chunk.length;
        setProgress(((i + 1) / chunks.length) * 100);
      }

      setStage('complete');
      onUploadComplete({ success: successCount, errors: processingErrors });
      
    } catch (error) {
      processingErrors.push(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setErrors(processingErrors);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setParsedData([]);
    setErrors([]);
    setProgress(0);
    setStage('upload');
    setIsProcessing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Grocery Items</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {stage === 'upload' && (
            <>
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="mb-4"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">
                  Drag and drop your CSV file here
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  or click to browse files
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="csv-upload"
                />
                <Button asChild variant="outline">
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <FileText className="h-4 w-4 mr-2" />
                    Select CSV File
                  </label>
                </Button>
              </div>
            </>
          )}

          {stage === 'preview' && (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Found {parsedData.length} items to import. Review and click "Import Items" to proceed.
                </AlertDescription>
              </Alert>

              <div className="max-h-60 overflow-y-auto border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Item Name</th>
                      <th className="p-2 text-left">Category</th>
                      <th className="p-2 text-left">Brand</th>
                      <th className="p-2 text-left">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{row['Item Name']}</td>
                        <td className="p-2">{row.Category}</td>
                        <td className="p-2">{row.Brand || '-'}</td>
                        <td className="p-2">{row.Quantity || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 10 && (
                  <div className="p-2 text-center text-gray-500 bg-gray-50">
                    ... and {parsedData.length - 10} more items
                  </div>
                )}
              </div>
            </>
          )}

          {stage === 'processing' && (
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p>Processing your grocery items...</p>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-500">{Math.round(progress)}% complete</p>
            </div>
          )}

          {stage === 'complete' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Upload completed successfully! Your grocery items have been added to the list.
              </AlertDescription>
            </Alert>
          )}

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Upload Errors:</div>
                <ul className="list-disc list-inside space-y-1">
                  {errors.slice(0, 5).map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                  {errors.length > 5 && (
                    <li className="text-sm">... and {errors.length - 5} more errors</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          {stage === 'upload' && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          
          {stage === 'preview' && (
            <>
              <Button variant="outline" onClick={reset}>
                Choose Different File
              </Button>
              <Button onClick={processUpload} disabled={parsedData.length === 0}>
                Import {parsedData.length} Items
              </Button>
            </>
          )}
          
          {stage === 'complete' && (
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
