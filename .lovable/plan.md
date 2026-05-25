## Add delete for script library rows

Add a delete (trash) button on each row in the "Script library" card on `/admin/video-studio` so admins can remove queued (or any) saved scripts.

### Scope
- File: `src/pages/admin/VideoStudioPage.tsx` only.
- No DB schema changes. `video_scripts` already exists; admin RLS should permit delete (will verify by attempting; if RLS blocks, add a follow-up migration — flagged below).

### Changes
1. Add `Trash2` to the lucide-react import.
2. Add `AlertDialog` (shadcn) import for a confirm step so accidental clicks don't nuke a script.
3. Add `handleDelete(id)`:
   - Calls `supabase.from("video_scripts").delete().eq("id", id)`.
   - On success: toast "Script deleted" and optimistic-remove from `scripts` state.
   - On error: toast error.
4. In each library row, add a small ghost icon Button (Trash2) on the right next to the status badge/download link. Wrap in `AlertDialog` with confirm text "Delete this script? This can't be undone." `e.stopPropagation()` on trigger click so the row's `handleLoadScript` doesn't also fire.
5. Make it work for any `render_status` (queued, ready, failed) — user asked for queued but no reason to restrict.

### Potential follow-up (only if delete fails)
If RLS blocks delete for admins, add a migration:
```sql
create policy "Admins can delete video_scripts"
on public.video_scripts for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));
```
I'll test after the UI change and only ship the migration if needed.

### Out of scope
- No bulk delete, no soft-delete/archive, no changes to render queue logic, no styling overhaul.
