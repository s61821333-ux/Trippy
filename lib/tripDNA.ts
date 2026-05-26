import type { Trip } from './types';

const CATEGORY_COLORS: Record<string, string> = {
  food:       '#C4714A',
  cafe:       '#C8944A',
  attraction: '#3B6E52',
  hotel:      '#5B8DBE',
  rest:       '#8B9DB0',
  transport:  '#7B6E8A',
  flight:     '#4A7AB5',
  concert:    '#9B59B6',
  theme_park: '#E74C3C',
  sport:      '#2ECC71',
  beach:      '#1ABC9C',
  other:      '#95A5A6',
};

function countCategories(events: Trip['events']): { label: string; count: number; color: string }[] {
  const counts: Record<string, number> = {};
  for (const dayEvents of Object.values(events)) {
    for (const ev of dayEvents) {
      counts[ev.category] = (counts[ev.category] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([cat, count]) => ({ label: cat, count, color: CATEGORY_COLORS[cat] ?? '#95A5A6' }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawPieChart(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  slices: { label: string; count: number; color: string }[],
) {
  const total = slices.reduce((s, c) => s + c.count, 0);
  if (total === 0) return;
  let start = -Math.PI / 2;
  for (const slice of slices) {
    const angle = (slice.count / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    start += angle;
  }
  // Center hole (donut)
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = '#1A0E08';
  ctx.fill();
}

function drawDNABars(
  ctx: CanvasRenderingContext2D,
  events: Trip['events'],
  x: number, y: number, w: number, h: number,
) {
  const allEvents = Object.values(events).flat();
  if (allEvents.length === 0) return;

  const barW = Math.max(4, Math.floor(w / (allEvents.length * 1.5)));
  const gap  = Math.floor((w - barW * allEvents.length) / (allEvents.length + 1));
  let cx = x + gap;

  allEvents.forEach(ev => {
    const [hh, mm] = ev.time.split(':').map(Number);
    const timeFrac = ((hh * 60 + mm) / 1440);
    const barH = Math.floor(h * 0.2 + timeFrac * h * 0.8);
    const color = CATEGORY_COLORS[ev.category] ?? '#C4714A';

    ctx.fillStyle = color + 'CC';
    drawRoundRect(ctx, cx, y + h - barH, barW, barH, barW / 2);
    ctx.fill();

    cx += barW + gap;
  });
}

export async function generateTripDNA(trip: Trip): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const W = 1080, H = 1920;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background gradient — desert feel
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0,    '#2C1A0E');
  grad.addColorStop(0.45, '#4A2A18');
  grad.addColorStop(1,    '#1A0E06');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle noise overlay (horizontal scan lines)
  for (let i = 0; i < H; i += 4) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.04})`;
    ctx.fillRect(0, i, W, 1);
  }

  // Top accent bar
  const accentGrad = ctx.createLinearGradient(0, 0, W, 0);
  accentGrad.addColorStop(0, '#C4714A');
  accentGrad.addColorStop(0.5, '#C8944A');
  accentGrad.addColorStop(1, '#C4714A');
  ctx.fillStyle = accentGrad;
  ctx.fillRect(80, 80, W - 160, 6);

  // Brand
  ctx.font = 'bold 36px sans-serif';
  ctx.fillStyle = 'rgba(244,239,232,0.5)';
  ctx.fillText('Trippy.', 80, 148);

  // Trip name
  ctx.font = `bold ${trip.name.length > 18 ? 62 : 76}px sans-serif`;
  ctx.fillStyle = '#F4EFE8';
  ctx.fillText(trip.name, 80, 260);

  // Days + participants
  const totalEvents = Object.values(trip.events).flat().length;
  ctx.font = '32px sans-serif';
  ctx.fillStyle = 'rgba(244,239,232,0.55)';
  ctx.fillText(`${trip.days} days  ·  ${totalEvents} events  ·  ${trip.participants.length} travellers`, 80, 316);

  // Countries badges
  const countries = trip.countries ?? [];
  let bx = 80;
  countries.slice(0, 5).forEach(c => {
    const tw = ctx.measureText(c).width;
    const bw = tw + 40;
    ctx.fillStyle = 'rgba(196,113,74,0.22)';
    drawRoundRect(ctx, bx, 352, bw, 48, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(196,113,74,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = '26px sans-serif';
    ctx.fillStyle = '#F4EFE8';
    ctx.fillText(c, bx + 20, 384);
    bx += bw + 12;
  });

  // Divider
  ctx.fillStyle = 'rgba(244,239,232,0.08)';
  ctx.fillRect(80, 440, W - 160, 1);

  // Activity breakdown — donut chart
  const categories = countCategories(trip.events);
  drawPieChart(ctx, 240, 700, 180, categories);

  // Legend
  let ly = 570;
  ctx.font = '24px sans-serif';
  categories.forEach(cat => {
    ctx.fillStyle = cat.color;
    drawRoundRect(ctx, 460, ly - 18, 24, 24, 6);
    ctx.fill();
    ctx.fillStyle = '#F4EFE8';
    ctx.fillText(cat.label.charAt(0).toUpperCase() + cat.label.slice(1), 496, ly);
    ctx.fillStyle = 'rgba(244,239,232,0.45)';
    ctx.fillText(`× ${cat.count}`, 780, ly);
    ly += 40;
  });

  // Section label
  ctx.font = '600 22px sans-serif';
  ctx.fillStyle = 'rgba(244,239,232,0.35)';
  ctx.letterSpacing = '0.12em';
  ctx.fillText('ACTIVITY BREAKDOWN', 80, 936);
  ctx.letterSpacing = '0';

  // Divider
  ctx.fillStyle = 'rgba(244,239,232,0.08)';
  ctx.fillRect(80, 960, W - 160, 1);

  // DNA fingerprint bars
  ctx.font = '600 22px sans-serif';
  ctx.fillStyle = 'rgba(244,239,232,0.35)';
  ctx.letterSpacing = '0.12em';
  ctx.fillText('TRIP DNA', 80, 1008);
  ctx.letterSpacing = '0';

  drawDNABars(ctx, trip.events, 80, 1030, W - 160, 200);

  // Divider
  ctx.fillStyle = 'rgba(244,239,232,0.08)';
  ctx.fillRect(80, 1270, W - 160, 1);

  // Day breakdown — mini timeline
  ctx.font = '600 22px sans-serif';
  ctx.fillStyle = 'rgba(244,239,232,0.35)';
  ctx.letterSpacing = '0.12em';
  ctx.fillText('DAILY RHYTHM', 80, 1318);
  ctx.letterSpacing = '0';

  const DAY_COLORS = ['#C4714A','#3B6E52','#5B8DBE','#C8944A','#8B5E9F'];
  let dy = 1350;
  for (let d = 1; d <= Math.min(trip.days, 7); d++) {
    const evts = trip.events[d] ?? [];
    const meta = trip.dayMeta?.[d - 1];
    const color = DAY_COLORS[(d - 1) % DAY_COLORS.length];

    ctx.fillStyle = color;
    drawRoundRect(ctx, 80, dy, 6, 38, 3);
    ctx.fill();

    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = '#F4EFE8';
    ctx.fillText(`Day ${d}${meta?.region ? ` — ${meta.region}` : ''}`, 102, dy + 26);

    ctx.font = '22px sans-serif';
    ctx.fillStyle = 'rgba(244,239,232,0.45)';
    ctx.fillText(`${evts.length} events`, W - 200, dy + 26);

    dy += 56;
    if (dy > 1720) { ctx.fillStyle = 'rgba(244,239,232,0.3)'; ctx.fillText('+ more…', 102, dy); break; }
  }

  // Footer
  ctx.fillStyle = 'rgba(244,239,232,0.08)';
  ctx.fillRect(80, H - 120, W - 160, 1);
  ctx.font = '28px sans-serif';
  ctx.fillStyle = 'rgba(244,239,232,0.4)';
  ctx.fillText('Planned with Trippy.', 80, H - 72);
  ctx.fillStyle = 'rgba(244,239,232,0.2)';
  ctx.fillText(new Date().getFullYear().toString(), W - 150, H - 72);

  return new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));
}

export async function shareTripDNA(trip: Trip): Promise<'shared' | 'downloaded' | 'failed'> {
  try {
    const blob = await generateTripDNA(trip);
    const file = new File([blob], `trippy-dna-${trip.name.toLowerCase().replace(/\s+/g, '-')}.png`, { type: 'image/png' });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: `${trip.name} — Trip DNA`, text: 'Check out my trip plan on Trippy!' });
      return 'shared';
    }

    // Fallback: download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    return 'downloaded';
  } catch {
    return 'failed';
  }
}
