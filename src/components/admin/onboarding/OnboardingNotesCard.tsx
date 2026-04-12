
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StickyNote, Plus, User, Users, Briefcase, Pencil, Trash2, Check, X } from "lucide-react";
import { format } from "date-fns";

export interface OnboardingNote {
  text: string;
  assigned_to: string; // "admin" | "family" | "caregiver"
  created_by: string;
  created_at: string;
}

interface OnboardingNotesCardProps {
  notes: OnboardingNote[];
  onAddNote: (note: OnboardingNote) => void;
  onEditNote?: (index: number, updatedNote: OnboardingNote) => void;
  onDeleteNote?: (index: number) => void;
  readOnly?: boolean;
  filterAssignee?: string;
}

const ASSIGNEE_OPTIONS = [
  { value: "admin", label: "Admin", icon: <Briefcase className="h-3 w-3" /> },
  { value: "family", label: "Family", icon: <User className="h-3 w-3" /> },
  { value: "caregiver", label: "Caregiver", icon: <Users className="h-3 w-3" /> },
];

export default function OnboardingNotesCard({ notes, onAddNote, onEditNote, onDeleteNote, readOnly = false, filterAssignee }: OnboardingNotesCardProps) {
  const [noteText, setNoteText] = useState("");
  const [assignTo, setAssignTo] = useState("admin");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const filteredNotes = filterAssignee
    ? notes.filter((n) => n.assigned_to === filterAssignee)
    : notes;

  const handleAdd = () => {
    if (!noteText.trim()) return;
    onAddNote({
      text: noteText.trim(),
      assigned_to: assignTo,
      created_by: "admin",
      created_at: new Date().toISOString(),
    });
    setNoteText("");
  };

  const handleStartEdit = (index: number, note: OnboardingNote) => {
    setEditingIndex(index);
    setEditText(note.text);
  };

  const handleSaveEdit = (index: number) => {
    if (!editText.trim() || !onEditNote) return;
    const note = filteredNotes[index];
    // Find the real index in the unfiltered notes array
    const realIndex = filterAssignee
      ? notes.findIndex((n) => n === note)
      : index;
    if (realIndex === -1) return;
    onEditNote(realIndex, { ...note, text: editText.trim() });
    setEditingIndex(null);
    setEditText("");
  };

  const handleDelete = (index: number) => {
    if (!onDeleteNote) return;
    const note = filteredNotes[index];
    const realIndex = filterAssignee
      ? notes.findIndex((n) => n === note)
      : index;
    if (realIndex === -1) return;
    if (window.confirm("Delete this note? This cannot be undone.")) {
      onDeleteNote(realIndex);
    }
  };

  const getAssigneeBadge = (assignee: string) => {
    const opt = ASSIGNEE_OPTIONS.find((o) => o.value === assignee);
    const colors: Record<string, string> = {
      admin: "bg-blue-100 text-blue-800",
      family: "bg-green-100 text-green-800",
      caregiver: "bg-purple-100 text-purple-800",
    };
    return (
      <Badge variant="secondary" className={`text-xs ${colors[assignee] || ""}`}>
        {opt?.icon} {opt?.label || assignee}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-base flex items-center gap-2">
          <StickyNote className="h-5 w-5" />
          Notes & Action Items
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!readOnly && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <Textarea
              placeholder="Type a note or action item..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={2}
            />
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Select value={assignTo} onValueChange={setAssignTo}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Assign to..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNEE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="flex items-center gap-2">{opt.icon} {opt.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" onClick={handleAdd} disabled={!noteText.trim()} className="gap-1">
                <Plus className="h-4 w-4" /> Add Note
              </Button>
            </div>
          </div>
        )}

        {filteredNotes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {readOnly ? "No notes yet." : "No notes yet. Add notes as you go through the call."}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredNotes.map((note, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border rounded-lg bg-background">
                <div className="flex-1 min-w-0">
                  {editingIndex === i && !readOnly ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={2}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="default" onClick={() => handleSaveEdit(i)} disabled={!editText.trim()} className="gap-1 h-7 text-xs">
                          <Check className="h-3 w-3" /> Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingIndex(null); setEditText(""); }} className="gap-1 h-7 text-xs">
                          <X className="h-3 w-3" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm">{note.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getAssigneeBadge(note.assigned_to)}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(note.created_at), "MMM d, yyyy h:mm a")}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                {!readOnly && editingIndex !== i && onEditNote && onDeleteNote && (
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleStartEdit(i, note)}
                      title="Edit note"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(i)}
                      title="Delete note"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
