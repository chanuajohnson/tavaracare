/**
 * Builds and opens the WhatsApp "shift check-in" message routed through
 * Tavara's central admin number (18687865357).
 *
 * Triggered the FIRST time a caregiver saves their daily checklist for a
 * shift — this is how Tavara records that the caregiver is on the job.
 */

interface CheckInPayload {
  caregiverName: string;
  clientName: string;
  shiftLabel?: string;       // e.g. "8 AM – 4 PM"
  scheduledStart?: string;   // e.g. "08:00"
  startedAtIso: string;      // server timestamp
  completedItems: number;
  totalItems: number;
}

const TAVARA_ADMIN_NUMBER = '18687865357';

const formatTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
};

const computeTimelinessTag = (
  scheduledStart: string | undefined,
  startedAtIso: string,
): string => {
  if (!scheduledStart) return '';
  try {
    const [h, m] = scheduledStart.split(':').map(Number);
    if (Number.isNaN(h)) return '';
    const started = new Date(startedAtIso);
    const scheduled = new Date(started);
    scheduled.setHours(h, m || 0, 0, 0);
    const diffMin = Math.round((started.getTime() - scheduled.getTime()) / 60000);

    if (diffMin <= 15 && diffMin >= -30) return ' (on time)';
    if (diffMin > 15 && diffMin <= 60) return ` (${diffMin} min late)`;
    if (diffMin > 60) return ` (very late, ${diffMin} min)`;
    return ` (${Math.abs(diffMin)} min early)`;
  } catch {
    return '';
  }
};

export const buildCheckInMessage = (payload: CheckInPayload): string => {
  const timeStr = formatTime(payload.startedAtIso);
  const tardiness = computeTimelinessTag(payload.scheduledStart, payload.startedAtIso);
  const shiftPart = payload.shiftLabel ? ` • ${payload.shiftLabel}` : '';
  return (
    `🟢 *Shift Check-In*\n` +
    `${payload.caregiverName} started shift for ${payload.clientName}${shiftPart}\n` +
    `Logged in at ${timeStr}${tardiness}\n` +
    `Checklist ${payload.completedItems}/${payload.totalItems} ticked\n\n` +
    `— Tavara Care`
  );
};

export const openCheckInWhatsApp = (payload: CheckInPayload): void => {
  const text = buildCheckInMessage(payload);
  const url =
    `https://api.whatsapp.com/send/?phone=${TAVARA_ADMIN_NUMBER}` +
    `&text=${encodeURIComponent(text)}&type=phone_number&app_absent=0`;
  window.open(url, '_blank');
};
