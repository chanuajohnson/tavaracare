
- Reel Studio (src/lib/reel): renderer is a pure drawFrame(ctx,t,spec,assets); family and caregiver data reach it only via admin-checked consent-gated RPCs (get_reel_safe_need, get_reel_safe_caregiver) plus client redact(), so no PII can enter reels, captions or logs.
