
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Trash2, GripVertical, FileText, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface ScreeningQuestion {
  question: string;
  category: string;
}

interface ScreeningTemplate {
  id: string;
  title: string;
  questions: ScreeningQuestion[];
  is_active: boolean;
  created_at: string;
}

const CATEGORIES = [
  'Clinical Competency',
  'Team & Rotation Fit',
  'Reliability & Professionalism',
  'Red-Flag Checks',
  'General',
];

export const ScreeningTemplateBuilder = () => {
  const [templates, setTemplates] = useState<ScreeningTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ScreeningTemplate | null>(null);
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<ScreeningQuestion[]>([
    { question: '', category: 'General' },
  ]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('screening_question_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(
        (data || []).map((t: any) => ({
          ...t,
          questions: Array.isArray(t.questions) ? t.questions : [],
        }))
      );
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions(prev => [...prev, { question: '', category: 'General' }]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: keyof ScreeningQuestion, value: string) => {
    setQuestions(prev => prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)));
  };

  const handleEdit = (template: ScreeningTemplate) => {
    setEditingTemplate(template);
    setTitle(template.title);
    setQuestions(template.questions.length > 0 ? template.questions : [{ question: '', category: 'General' }]);
    setShowDialog(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setTitle('');
    setQuestions([{ question: '', category: 'General' }]);
    setShowDialog(true);
  };

  const handleSave = async () => {
    const validQuestions = questions.filter(q => q.question.trim());
    if (!title.trim() || validQuestions.length === 0) {
      toast.error('Please provide a title and at least one question');
      return;
    }

    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('screening_question_templates')
          .update({
            title: title.trim(),
            questions: validQuestions as any,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingTemplate.id);
        if (error) throw error;
        toast.success('Template updated');
      } else {
        const { error } = await supabase
          .from('screening_question_templates')
          .insert({
            title: title.trim(),
            questions: validQuestions as any,
          });
        if (error) throw error;
        toast.success('Template created');
      }
      setShowDialog(false);
      fetchTemplates();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save template');
    }
  };

  const handleToggleActive = async (template: ScreeningTemplate) => {
    try {
      const { error } = await supabase
        .from('screening_question_templates')
        .update({ is_active: !template.is_active, updated_at: new Date().toISOString() })
        .eq('id', template.id);
      if (error) throw error;
      fetchTemplates();
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle template');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Screening Templates
            </CardTitle>
            <CardDescription>Reusable question sets for professional caregiver screening calls</CardDescription>
          </div>
          <Button onClick={handleCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No templates yet. Create one to start sending voice screening questionnaires.
          </p>
        ) : (
          <div className="space-y-3">
            {templates.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.questions.length} questions
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={t.is_active ? 'default' : 'secondary'}>
                    {t.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleToggleActive(t)}>
                    {t.is_active ? 'Disable' : 'Enable'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(t)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Screening Template'}</DialogTitle>
            <DialogDescription>
              Define the questions the head nurse will answer about each candidate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template Title</Label>
              <Input
                placeholder="e.g. Standard Caregiver Screening"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Questions</Label>
              {questions.map((q, i) => (
                <div key={i} className="flex gap-2 items-start p-3 border rounded-lg bg-muted/30">
                  <GripVertical className="h-4 w-4 mt-2 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder={`Question ${i + 1}`}
                      value={q.question}
                      onChange={e => handleQuestionChange(i, 'question', e.target.value)}
                    />
                    <Select
                      value={q.category}
                      onValueChange={v => handleQuestionChange(i, 'category', v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {questions.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveQuestion(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={handleAddQuestion} className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Add Question
              </Button>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="flex-1">
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
