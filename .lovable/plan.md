## Goal
On `/blog/:slug`, hide the "Listen to this article" audio narration **only** when the logged-in admin `chanuajohnson3@gmail.com` is viewing the post. All other visitors (logged out, families, professionals, other admins) continue to see the player unchanged.

The admin keeps full access to `/blog` and to the admin dashboard blog management — nothing else changes.

## Scope
Single file: `src/pages/blog/BlogPostPage.tsx`

## Change
1. Import `useAuth` from `@/components/providers/AuthProvider`.
2. Pull `user` from the auth context inside the component.
3. Compute `const isOwnerAdmin = user?.email?.toLowerCase() === 'chanuajohnson3@gmail.com';`
4. Wrap the existing render at line 462:
   ```tsx
   {!isOwnerAdmin && <BlogAudioPlayer postId={post.id} className="mb-10" />}
   ```

## Out of scope
- `BlogAudioPlayer.tsx` itself — untouched.
- Admin dashboard blog management — untouched.
- Routing, auth flow, or any other blog UI — untouched.

## Verification
- Logged out / non-admin user on `/blog/<slug>` → player visible.
- Logged in as `chanuajohnson3@gmail.com` on `/blog/<slug>` → player hidden, rest of post renders normally.
- `/dashboard/admin` blog tools continue to work.
