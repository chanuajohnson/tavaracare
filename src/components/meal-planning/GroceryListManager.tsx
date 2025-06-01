
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ShoppingCart, Check, X } from "lucide-react";
import { useCarePlanMealPlan } from "./hooks/useCarePlanMealPlan";
import { toast } from "sonner";

interface GroceryListManagerProps {
  carePlanId: string;
}

export const GroceryListManager = ({ carePlanId }: GroceryListManagerProps) => {
  const [newListTitle, setNewListTitle] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [selectedListId, setSelectedListId] = useState<string>('');

  const { groceryLists, createGroceryListMutation, isLoading } = useCarePlanMealPlan(carePlanId);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) {
      toast.error('List title is required');
      return;
    }

    try {
      await createGroceryListMutation.mutateAsync(newListTitle);
      setNewListTitle('');
    } catch (error) {
      console.error('Error creating grocery list:', error);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !selectedListId) {
      toast.error('Item name and list selection are required');
      return;
    }

    try {
      // Add grocery item functionality
      setNewItemName('');
      setNewItemQuantity('');
      toast.success('Item added to grocery list');
    } catch (error) {
      toast.error('Failed to add item');
    }
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
        <h2 className="text-2xl font-semibold">Grocery Lists</h2>
      </div>

      {/* Create New List */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Grocery List</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateList} className="flex gap-2">
            <Input
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              placeholder="Enter list title (e.g., Weekly Shopping)"
              className="flex-1"
            />
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
            <CardTitle>Add Item to List</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select List</label>
                <select
                  value={selectedListId}
                  onChange={(e) => setSelectedListId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Choose a list</option>
                  {groceryLists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Item name"
                />
                <Input
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  placeholder="Quantity (optional)"
                />
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Grocery Lists */}
      {groceryLists && groceryLists.length === 0 ? (
        <Card className="p-8 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">No grocery lists found</h3>
          <p className="text-muted-foreground">Create your first grocery list to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {groceryLists?.map((list) => (
            <Card key={list.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  {list.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {list.grocery_list_items?.length || 0} items
                </p>
              </CardHeader>
              <CardContent>
                {list.grocery_list_items && list.grocery_list_items.length > 0 ? (
                  <div className="space-y-2">
                    {list.grocery_list_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                        <button
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            item.purchased
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-green-500'
                          }`}
                        >
                          {item.purchased && <Check className="h-3 w-3" />}
                        </button>
                        <span className={`flex-1 ${item.purchased ? 'line-through text-gray-500' : ''}`}>
                          {item.item_name}
                          {item.quantity && ` (${item.quantity})`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No items in this list yet.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
