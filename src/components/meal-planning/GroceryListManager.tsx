
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingCart, Check, X, Edit2, Star, Trash2, Upload } from "lucide-react";
import { useCarePlanMealPlan } from "./hooks/useCarePlanMealPlan";
import { GroceryItem } from "@/services/mealPlanService";
import { EditGroceryItemDialog } from "./components/EditGroceryItemDialog";
import { DeleteGroceryItemDialog } from "./components/DeleteGroceryItemDialog";
import { CSVUploadDialog } from "./components/CSVUploadDialog";

interface GroceryListManagerProps {
  carePlanId: string;
}

const urgencyColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800', 
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

const categories = [
  'Food Goods', 'Dairy & Eggs', 'Meat & Seafood', 'Produce', 'Bakery',
  'Frozen Foods', 'Pantry Staples', 'Beverages', 'Snacks', 'Personal Care',
  'Household Items', 'Health & Medicine', 'Other'
];

export const GroceryListManager = ({ carePlanId }: GroceryListManagerProps) => {
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<GroceryItem | null>(null);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  
  // New item form state
  const [newItem, setNewItem] = useState({
    category: 'Food Goods',
    item_name: '',
    description: '',
    brand: '',
    quantity: '',
    size_weight: '',
    estimated_price: '',
    store_section: '',
    notes: '',
    urgency_level: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    priority: 1
  });

  const { 
    groceryLists, 
    mealPlans,
    createGroceryListMutation, 
    addGroceryItemMutation,
    bulkAddGroceryItemsMutation,
    updateGroceryItemMutation,
    markItemCompletedMutation,
    deleteGroceryItemMutation,
    generateGroceryListMutation,
    isLoading 
  } = useCarePlanMealPlan(carePlanId);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      await createGroceryListMutation.mutateAsync({
        name: newListName,
        description: newListDescription || undefined
      });
      setNewListName('');
      setNewListDescription('');
    } catch (error) {
      console.error('Error creating grocery list:', error);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.item_name.trim() || !selectedListId) return;

    try {
      await addGroceryItemMutation.mutateAsync({
        groceryListId: selectedListId,
        itemData: {
          ...newItem,
          estimated_price: newItem.estimated_price ? parseFloat(newItem.estimated_price) : undefined
        }
      });
      
      // Reset form
      setNewItem({
        category: 'Food Goods',
        item_name: '',
        description: '',
        brand: '',
        quantity: '',
        size_weight: '',
        estimated_price: '',
        store_section: '',
        notes: '',
        urgency_level: 'medium',
        priority: 1
      });
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleToggleCompleted = async (item: GroceryItem) => {
    await markItemCompletedMutation.mutateAsync({
      itemId: item.id,
      completed: !item.is_completed
    });
  };

  const handleGenerateFromMealPlans = async () => {
    if (!mealPlans || mealPlans.length === 0) return;

    try {
      await generateGroceryListMutation.mutateAsync({
        mealPlanIds: mealPlans.map(mp => mp.id),
        listName: `Weekly Groceries - ${new Date().toLocaleDateString()}`
      });
    } catch (error) {
      console.error('Error generating grocery list:', error);
    }
  };

  const handleEditItem = async (updates: Partial<GroceryItem>) => {
    if (!editingItem) return;

    try {
      await updateGroceryItemMutation.mutateAsync({
        itemId: editingItem.id,
        updates
      });
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;

    try {
      await deleteGroceryItemMutation.mutateAsync(deletingItem.id);
      setDeletingItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleCSVUploadComplete = (results: { success: number; errors: string[] }) => {
    console.log('CSV Upload Results:', results);
    setShowCSVUpload(false);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Loading grocery lists...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Enhanced Grocery Lists</h2>
        <div className="flex gap-2">
          {groceryLists && groceryLists.length > 0 && (
            <Button 
              onClick={() => setShowCSVUpload(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Bulk Upload CSV
            </Button>
          )}
          {mealPlans && mealPlans.length > 0 && (
            <Button 
              onClick={handleGenerateFromMealPlans}
              disabled={generateGroceryListMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <Star className="h-4 w-4 mr-2" />
              Generate from Meal Plans
            </Button>
          )}
        </div>
      </div>

      {/* Create New List */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Grocery List</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateList} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="List name (e.g., Weekly Shopping)"
                required
              />
              <Textarea
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="Description (optional)"
                className="resize-none"
                rows={1}
              />
            </div>
            <Button type="submit" disabled={createGroceryListMutation.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Create List
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Add Items */}
      {groceryLists && groceryLists.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Add Enhanced Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={selectedListId} onValueChange={setSelectedListId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a list" />
                  </SelectTrigger>
                  <SelectContent>
                    {groceryLists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  value={newItem.item_name}
                  onChange={(e) => setNewItem({...newItem, item_name: e.target.value})}
                  placeholder="Item name *"
                  required
                />
                <Input
                  value={newItem.brand}
                  onChange={(e) => setNewItem({...newItem, brand: e.target.value})}
                  placeholder="Brand (optional)"
                />
                <Input
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                  placeholder="Quantity (e.g., 2 lbs)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  value={newItem.size_weight}
                  onChange={(e) => setNewItem({...newItem, size_weight: e.target.value})}
                  placeholder="Size/Weight"
                />
                <Input
                  type="number"
                  step="0.01"
                  value={newItem.estimated_price}
                  onChange={(e) => setNewItem({...newItem, estimated_price: e.target.value})}
                  placeholder="Price ($)"
                />
                <Input
                  value={newItem.store_section}
                  onChange={(e) => setNewItem({...newItem, store_section: e.target.value})}
                  placeholder="Store section"
                />
                <Select value={newItem.urgency_level} onValueChange={(value: any) => setNewItem({...newItem, urgency_level: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                value={newItem.notes}
                onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                placeholder="Notes (optional)"
                rows={2}
              />

              <Button type="submit" disabled={!selectedListId || !newItem.item_name.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Enhanced Item
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Grocery Lists Display */}
      {groceryLists && groceryLists.length === 0 ? (
        <Card className="p-8 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">No grocery lists found</h3>
          <p className="text-muted-foreground">Create your first enhanced grocery list to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {groceryLists?.map((list) => (
            <Card key={list.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      {list.name}
                    </CardTitle>
                    {list.description && (
                      <p className="text-sm text-muted-foreground mt-1">{list.description}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {list.grocery_items?.length || 0} items • 
                      {list.grocery_items?.filter(item => item.is_completed).length || 0} completed
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedListId(list.id);
                      setShowCSVUpload(true);
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    CSV Upload
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {list.grocery_items && list.grocery_items.length > 0 ? (
                  <div className="space-y-3">
                    {list.grocery_items
                      .sort((a, b) => {
                        // Sort by completed status first, then by urgency, then by priority
                        if (a.is_completed !== b.is_completed) {
                          return a.is_completed ? 1 : -1;
                        }
                        const urgencyOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                        if (urgencyOrder[a.urgency_level] !== urgencyOrder[b.urgency_level]) {
                          return urgencyOrder[b.urgency_level] - urgencyOrder[a.urgency_level];
                        }
                        return b.priority - a.priority;
                      })
                      .map((item) => (
                      <div 
                        key={item.id} 
                        className={`flex items-start gap-3 p-3 border rounded-lg ${
                          item.is_completed ? 'bg-gray-50 opacity-75' : 'bg-white'
                        }`}
                      >
                        <button
                          onClick={() => handleToggleCompleted(item)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-1 ${
                            item.is_completed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-green-500'
                          }`}
                        >
                          {item.is_completed && <Check className="h-3 w-3" />}
                        </button>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-medium ${item.is_completed ? 'line-through text-gray-500' : ''}`}>
                              {item.item_name}
                            </span>
                            {item.brand && (
                              <span className="text-sm text-gray-500">({item.brand})</span>
                            )}
                            <Badge className={urgencyColors[item.urgency_level]}>
                              {item.urgency_level}
                            </Badge>
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {item.category}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {item.quantity && <span>Qty: {item.quantity}</span>}
                            {item.size_weight && <span>Size: {item.size_weight}</span>}
                            {item.estimated_price && <span>~${item.estimated_price}</span>}
                            {item.store_section && <span>Section: {item.store_section}</span>}
                          </div>
                          
                          {item.notes && (
                            <p className="text-sm text-gray-600 italic">{item.notes}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingItem(item)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingItem(item)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No items in this list yet.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Item Dialog */}
      {editingItem && (
        <EditGroceryItemDialog
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          groceryItem={editingItem}
          onSave={handleEditItem}
        />
      )}

      {/* Delete Item Dialog */}
      {deletingItem && (
        <DeleteGroceryItemDialog
          open={!!deletingItem}
          onOpenChange={(open) => !open && setDeletingItem(null)}
          groceryItem={deletingItem}
          onConfirm={handleDeleteItem}
        />
      )}

      {/* CSV Upload Dialog */}
      <CSVUploadDialog
        open={showCSVUpload}
        onOpenChange={setShowCSVUpload}
        groceryListId={selectedListId}
        onUploadComplete={handleCSVUploadComplete}
      />
    </div>
  );
};
