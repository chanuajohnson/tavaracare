
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GroceryItem } from "@/services/mealPlanService";

interface EditGroceryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groceryItem: GroceryItem;
  onSave: (updates: Partial<GroceryItem>) => void;
}

const categories = [
  'Food Goods', 'Dairy & Eggs', 'Meat & Seafood', 'Produce', 'Bakery',
  'Frozen Foods', 'Pantry Staples', 'Beverages', 'Snacks', 'Personal Care',
  'Household Items', 'Health & Medicine', 'Other'
];

const urgencyLevels = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

export const EditGroceryItemDialog = ({ open, onOpenChange, groceryItem, onSave }: EditGroceryItemDialogProps) => {
  const [formData, setFormData] = useState({
    category: groceryItem.category || 'Food Goods',
    item_name: groceryItem.item_name || '',
    description: groceryItem.description || '',
    brand: groceryItem.brand || '',
    quantity: groceryItem.quantity || '',
    size_weight: groceryItem.size_weight || '',
    estimated_price: groceryItem.estimated_price?.toString() || '',
    store_section: groceryItem.store_section || '',
    substitutes: groceryItem.substitutes || '',
    notes: groceryItem.notes || '',
    urgency_level: groceryItem.urgency_level || 'medium',
    preferred_store: groceryItem.preferred_store || '',
    priority: groceryItem.priority?.toString() || '1'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const updates: Partial<GroceryItem> = {};
    
    // Only include fields that have actually changed
    Object.keys(formData).forEach(key => {
      const originalValue = groceryItem[key as keyof GroceryItem];
      const newValue = formData[key as keyof typeof formData];
      
      if (key === 'estimated_price') {
        const numValue = newValue ? parseFloat(newValue) : undefined;
        if (numValue !== originalValue) {
          updates.estimated_price = numValue;
        }
      } else if (key === 'priority') {
        const numValue = newValue ? parseInt(newValue) : 1;
        if (numValue !== originalValue) {
          updates.priority = numValue;
        }
      } else if (newValue !== originalValue) {
        (updates as any)[key] = newValue || null;
      }
    });
    
    onSave(updates);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Grocery Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select value={formData.urgency_level} onValueChange={(value) => handleInputChange('urgency_level', value)}>
                <SelectTrigger id="urgency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {urgencyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item_name">Item Name *</Label>
              <Input
                id="item_name"
                value={formData.item_name}
                onChange={(e) => handleInputChange('item_name', e.target.value)}
                placeholder="Item name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="Brand name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Item description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="e.g., 2 lbs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size_weight">Size/Weight</Label>
              <Input
                id="size_weight"
                value={formData.size_weight}
                onChange={(e) => handleInputChange('size_weight', e.target.value)}
                placeholder="e.g., 5 lbs each"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_price">Price ($)</Label>
              <Input
                id="estimated_price"
                type="number"
                step="0.01"
                value={formData.estimated_price}
                onChange={(e) => handleInputChange('estimated_price', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="store_section">Store Section</Label>
              <Input
                id="store_section"
                value={formData.store_section}
                onChange={(e) => handleInputChange('store_section', e.target.value)}
                placeholder="e.g., Aisle 3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_store">Preferred Store</Label>
              <Input
                id="preferred_store"
                value={formData.preferred_store}
                onChange={(e) => handleInputChange('preferred_store', e.target.value)}
                placeholder="Store name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority (1-5)</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="5"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                placeholder="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="substitutes">Substitutes</Label>
            <Input
              id="substitutes"
              value={formData.substitutes}
              onChange={(e) => handleInputChange('substitutes', e.target.value)}
              placeholder="Alternative products"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes or special instructions"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.item_name.trim()}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
