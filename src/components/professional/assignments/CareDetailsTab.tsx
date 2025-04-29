
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CarePlan {
  created_at?: string;
  description?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

interface CareDetailsTabProps {
  carePlan?: CarePlan;
  formatDate: (dateString: string) => string;
}

export function CareDetailsTab({ carePlan, formatDate }: CareDetailsTabProps) {
  console.log("CareDetailsTab received carePlan:", carePlan);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Plan Details</CardTitle>
        {carePlan?.created_at && (
          <CardDescription>
            Created on {formatDate(carePlan.created_at)}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {carePlan?.description ? (
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-gray-600">{carePlan.description}</p>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No detailed description available</p>
          </div>
        )}

        {carePlan?.metadata && (
          <div>
            <h3 className="font-medium mb-2">Care Requirements</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(carePlan.metadata).map(([key, value]) => (
                <div key={key} className="border rounded-md p-3 bg-gray-50">
                  <p className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-gray-600">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
