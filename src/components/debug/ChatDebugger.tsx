
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Database, Sparkles } from "lucide-react";

export function ChatDebugger() {
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState<Record<string, any[]>>({});
  
  const checkTables = async () => {
    setIsLoading(true);
    const tables = ['assistant_nudges', 'profiles', 'auth.users'];
    const results: Record<string, any[]> = {};
    
    try {
      for (const table of tables) {
        if (table === 'auth.users') {
          // Skip auth.users as it requires special permissions
          results[table] = [{ note: 'Requires special permissions' }];
          continue;
        }
        
        const { data, error } = await supabase
          .from(table as any)
          .select('*')
          .limit(10);
          
        if (error) {
          console.error(`Error fetching ${table}:`, error);
          results[table] = [{ error: error.message }];
        } else {
          results[table] = data || [];
          console.log(`Found ${data?.length || 0} rows in ${table}`);
        }
      }
      
      setTableData(results);
    } catch (err) {
      console.error('Error checking tables:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearLocalStorage = () => {
    localStorage.clear();
    alert('Local storage cleared!');
  };
  
  const getStatusBadge = (tableName: string) => {
    if (!tableData[tableName]) return <Badge variant="outline">Not checked</Badge>;
    
    if (tableData[tableName][0]?.error) {
      return <Badge variant="destructive">Error</Badge>;
    }
    
    return <Badge variant={tableData[tableName].length > 0 ? "default" : "secondary"}>
      {tableData[tableName].length > 0 ? `${tableData[tableName].length} rows` : 'Empty'}
    </Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          TAV System Debugger
        </CardTitle>
        <CardDescription>
          Diagnose TAV assistant and database connectivity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="data">
          <TabsList className="w-full">
            <TabsTrigger value="data" className="flex-1">Database</TabsTrigger>
            <TabsTrigger value="storage" className="flex-1">Local Storage</TabsTrigger>
          </TabsList>
          
          <TabsContent value="data" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Database Tables</h3>
              <Button onClick={checkTables} disabled={isLoading} variant="outline" size="sm">
                {isLoading ? 'Checking...' : 'Check Tables'}
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                <div className="font-medium text-xs">assistant_nudges</div>
                {getStatusBadge('assistant_nudges')}
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                <div className="font-medium text-xs">profiles</div>
                {getStatusBadge('profiles')}
              </div>
            </div>
            
            {Object.keys(tableData).map(table => (
              tableData[table].length > 0 && !tableData[table][0]?.error && (
                <Collapsible key={table} className="w-full">
                  <CollapsibleTrigger className="flex w-full justify-between items-center text-sm p-2 bg-blue-50 text-blue-800 rounded-md hover:bg-blue-100">
                    <span>Show {table} data</span>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-2 bg-blue-50/50 p-2 rounded-md overflow-x-auto text-xs">
                      <pre className="text-[10px]">
                        {JSON.stringify(tableData[table], null, 2)}
                      </pre>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            ))}
          </TabsContent>
          
          <TabsContent value="storage" className="space-y-4 pt-4">
            <div className="bg-muted/50 rounded-md p-3">
              <h3 className="text-sm font-medium mb-2">LocalStorage Keys</h3>
              <div className="grid grid-cols-1 gap-2">
                {Object.keys(localStorage).map(key => (
                  <div key={key} className="bg-background p-2 rounded flex justify-between items-center">
                    <span className="text-xs font-mono">{key}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {localStorage.getItem(key)?.length} chars
                    </Badge>
                  </div>
                ))}
                {Object.keys(localStorage).length === 0 && (
                  <div className="text-xs text-muted-foreground">No items in localStorage</div>
                )}
              </div>
            </div>
            <Button onClick={clearLocalStorage} variant="outline" size="sm" className="w-full">
              Clear All LocalStorage
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        TAV system debugger - check database connectivity and local storage.
      </CardFooter>
    </Card>
  );
}
