## Change author byline to Chanua Johnson with profile photo

**Scope:** Blog index cards + blog post header. Two files, plus one new asset.

### Files
1. **Copy photo** → `src/assets/chanua-johnson.jpg` (from `user-uploads://Chan_In_Freeport_Light_and_Airy_Original.jpg`)
2. **`src/content/blog/posts.ts`** — change every post's `author` from `"The Tavara Care Team"` to `"Chanua Johnson, Tavara Care Coordinator & Founder"` (one find-and-replace)
3. **`src/components/blog/BlogCard.tsx`** — replace the `· {post.author}` text with a small `<Avatar>` (h-6 w-6) + name inline, using the imported photo
4. **`src/pages/blog/BlogPostPage.tsx`** — replace the `By {post.author}` line under the H1 with an Avatar (h-10 w-10) + "Chanua Johnson" name + role on a second line, left-aligned

### Visual treatment
- Avatar: rounded-full, semantic border (`border-border`), object-cover
- Card: 24px circle, name in muted-foreground text-sm
- Post header: 40px circle, name in foreground font-medium, role in muted-foreground text-sm below
- Uses existing shadcn `Avatar` component (already in project)

### Not touched
- Author field stays a single string in the data model (no schema change). Photo is hardcoded since there's one author. If a second author is ever added, refactor to an `authors` map then.
- Schema.org `author.name` will pick up the new string automatically.
- No routing, no nav, no chat flow, no registration changes.
