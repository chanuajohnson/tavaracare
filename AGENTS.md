
- Reel Studio (src/lib/reel): renderer is a pure drawFrame(ctx,t,spec,assets); family data reaches it only via admin-checked get_reel_safe_need RPC plus client redact(), so no PII can enter reels, captions or logs.
