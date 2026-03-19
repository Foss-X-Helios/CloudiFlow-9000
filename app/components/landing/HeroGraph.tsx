import { useEffect, useRef } from "react";
import anime from "animejs";

// ─── Layout ───
const W = 560;
const H = 420;
const SIDEBAR_W = 114;
const TITLE_H = 32;
const NODE_W = 152;
const NODE_H = 52;
const HANDLE_SIZE = 10; // outer diameter of handle circle

// ─── Components matching the real editor ───
const components = [
  { id: "vpc",  label: "VPC",            category: "NETWORK",  iconType: "network" as const },
  { id: "ec2",  label: "EC2 Instance",   category: "COMPUTE",  iconType: "server" as const },
  { id: "r53",  label: "Route 53",       category: "DNS",      iconType: "globe" as const },
  { id: "sg",   label: "Security Group", category: "SECURITY", iconType: "shield" as const },
];

// ─── Canvas positions ───
const cx = SIDEBAR_W + (W - SIDEBAR_W) / 2;
const positions = [
  { x: cx - 40,  y: TITLE_H + 44 },   // VPC — top center
  { x: cx + 30,  y: TITLE_H + 135 },   // EC2 — middle right
  { x: cx - 120, y: TITLE_H + 270 },   // Route 53 — bottom left
  { x: cx + 50,  y: TITLE_H + 260 },   // Security Group — bottom right
];

// ─── Connections: [from, to] ───
const connections: [number, number][] = [
  [0, 1], // VPC → EC2
  [1, 2], // EC2 → Route 53
  [1, 3], // EC2 → Security Group
];

// ─── State ───
interface AnimState {
  cursor: { x: number; y: number; opacity: number; pressing: boolean };
  nodes: { x: number; y: number; opacity: number; scale: number; selected: boolean }[];
  dragGhost: { x: number; y: number; opacity: number; idx: number };
  edges: { progress: number; src: number; tgt: number }[];
  connLine: { x1: number; y1: number; x2: number; y2: number; opacity: number };
  sidebarHl: number;
  time: number;
}

function sidebarY(i: number): number {
  return TITLE_H + 48 + i * 44;
}

export function HeroGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stRef = useRef<AnimState | null>(null);
  const frameRef = useRef(0);
  const tlRef = useRef<ReturnType<typeof anime.timeline> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const st: AnimState = {
      cursor: { x: 55, y: 140, opacity: 0, pressing: false },
      nodes: positions.map(() => ({ x: 0, y: 0, opacity: 0, scale: 0, selected: false })),
      dragGhost: { x: 0, y: 0, opacity: 0, idx: 0 },
      edges: connections.map(([s, t]) => ({ progress: 0, src: s, tgt: t })),
      connLine: { x1: 0, y1: 0, x2: 0, y2: 0, opacity: 0 },
      sidebarHl: -1,
      time: 0,
    };
    stRef.current = st;

    function buildTL() {
      // Reset
      st.cursor = { x: 55, y: 140, opacity: 0, pressing: false };
      st.dragGhost.opacity = 0;
      st.sidebarHl = -1;
      st.connLine.opacity = 0;
      for (const n of st.nodes) { n.opacity = 0; n.scale = 0; n.selected = false; }
      for (const e of st.edges) { e.progress = 0; }

      const tl = anime.timeline({ easing: "easeInOutCubic", autoplay: true });

      // Cursor fade in
      tl.add({ targets: st.cursor, opacity: [0, 1], duration: 700 });

      // Brief pause before starting
      tl.add({ targets: st.cursor, duration: 400 });

      // ── Drop each node ──
      for (let i = 0; i < 4; i++) {
        const pos = positions[i];
        const sy = sidebarY(i) + 12;

        // Move to sidebar
        tl.add({
          targets: st.cursor, x: SIDEBAR_W / 2, y: sy,
          duration: 550, easing: "easeInOutQuad",
          begin: () => { st.sidebarHl = i; },
        });

        // Hover pause
        tl.add({ targets: st.cursor, duration: 250 });

        // Grab
        tl.add({
          targets: st.cursor, duration: 200,
          begin: () => {
            st.cursor.pressing = true;
            st.dragGhost.idx = i;
            st.dragGhost.x = SIDEBAR_W / 2;
            st.dragGhost.y = sy;
            st.dragGhost.opacity = 1;
          },
        });

        // Drag to position
        tl.add({
          targets: [st.cursor, st.dragGhost],
          x: pos.x + NODE_W / 2, y: pos.y + NODE_H / 2,
          duration: 800, easing: "easeInOutCubic",
        });

        // Drop
        tl.add({
          targets: st.cursor, duration: 120,
          begin: () => {
            st.cursor.pressing = false;
            st.dragGhost.opacity = 0;
            st.sidebarHl = -1;
            st.nodes[i].x = pos.x;
            st.nodes[i].y = pos.y;
            st.nodes[i].opacity = 1;
          },
        });

        // Pop in
        tl.add({ targets: st.nodes[i], scale: [0, 1], duration: 450, easing: "easeOutBack" });

        // Pause between drops
        if (i < 3) tl.add({ targets: st.cursor, duration: 350 });
      }

      // Pause before connecting
      tl.add({ targets: st.cursor, duration: 600 });

      // ── Draw connections ──
      for (let ci = 0; ci < connections.length; ci++) {
        const [si, ti] = connections[ci];
        const sPos = positions[si];
        const tPos = positions[ti];

        // Bottom handle of source
        const sx = sPos.x + NODE_W / 2;
        const sy = sPos.y + NODE_H + HANDLE_SIZE / 2 + 1;
        // Top handle of target
        const tx = tPos.x + NODE_W / 2;
        const ty = tPos.y - HANDLE_SIZE / 2 - 1;

        // Cursor to source handle
        tl.add({
          targets: st.cursor, x: sx, y: sy,
          duration: 500, easing: "easeInOutQuad",
          begin: () => { st.nodes[si].selected = true; },
        });

        // Hover on handle
        tl.add({ targets: st.cursor, duration: 200 });

        // Press
        tl.add({
          targets: st.cursor, duration: 180,
          begin: () => {
            st.cursor.pressing = true;
            st.connLine.x1 = sx; st.connLine.y1 = sy;
            st.connLine.x2 = sx; st.connLine.y2 = sy;
            st.connLine.opacity = 1;
          },
        });

        // Drag to target handle
        tl.add({
          targets: st.cursor, x: tx, y: ty,
          duration: 700, easing: "easeInOutCubic",
          update: () => { st.connLine.x2 = st.cursor.x; st.connLine.y2 = st.cursor.y; },
          begin: () => { st.nodes[ti].selected = true; },
        });

        // Release
        tl.add({
          targets: st.cursor, duration: 120,
          begin: () => {
            st.cursor.pressing = false;
            st.connLine.opacity = 0;
            st.nodes[si].selected = false;
            st.nodes[ti].selected = false;
          },
        });

        // Edge draw
        tl.add({ targets: st.edges[ci], progress: [0, 1], duration: 500, easing: "easeOutCubic" });

        // Pause between connections
        if (ci < connections.length - 1) tl.add({ targets: st.cursor, duration: 350 });
      }

      // Hold and fade
      tl.add({ targets: st.cursor, opacity: [1, 0], duration: 700, delay: 2500 });
      tl.add({
        targets: st.cursor, duration: 1800,
        complete: () => { tlRef.current = buildTL(); },
      });

      return tl;
    }

    function draw() {
      if (!ctx || !stRef.current) return;
      const s = stRef.current;
      s.time += 0.016;
      ctx.clearRect(0, 0, W, H);

      drawChrome(ctx);
      drawSidebar(ctx, s);
      drawDotGrid(ctx);
      drawEdges(ctx, s);
      drawNodes(ctx, s);
      drawConnLine(ctx, s);
      drawGhost(ctx, s);
      drawCursor(ctx, s);

      frameRef.current = requestAnimationFrame(draw);
    }

    tlRef.current = buildTL();
    draw();
    return () => {
      cancelAnimationFrame(frameRef.current);
      if (tlRef.current) tlRef.current.pause();
    };
  }, []);

  return (
    <div className="hero-graph relative w-full max-w-[560px] rounded-2xl border border-[#1c1c1c] bg-[#0a0a0a] overflow-hidden shadow-[0_50px_140px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.02)_inset]">
      <canvas ref={canvasRef} className="w-full relative z-[1]" style={{ aspectRatio: `${W}/${H}` }} />
    </div>
  );
}

// ════════════════════════════════
// CHROME
// ════════════════════════════════

function drawChrome(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#0e0e0e";
  ctx.fillRect(0, 0, W, TITLE_H);
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, TITLE_H + 0.5);
  ctx.lineTo(W, TITLE_H + 0.5);
  ctx.stroke();

  // Traffic dots
  [["#ff5f57", 0.55], ["#febc2e", 0.55], ["#28c840", 0.55]].forEach(([c, a], i) => {
    ctx.beginPath();
    ctx.arc(18 + i * 16, TITLE_H / 2, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = c as string;
    ctx.globalAlpha = a as number;
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  ctx.font = "500 10px 'Inter', sans-serif";
  ctx.fillStyle = "#333";
  ctx.textAlign = "center";
  ctx.fillText("CloudiFlow-9000 — Editor", W / 2, TITLE_H / 2 + 3.5);
}

// ════════════════════════════════
// SIDEBAR
// ════════════════════════════════

function drawSidebar(ctx: CanvasRenderingContext2D, s: AnimState) {
  ctx.fillStyle = "#0d0d0d";
  ctx.fillRect(0, TITLE_H, SIDEBAR_W, H - TITLE_H);
  ctx.strokeStyle = "#181818";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(SIDEBAR_W + 0.5, TITLE_H);
  ctx.lineTo(SIDEBAR_W + 0.5, H);
  ctx.stroke();

  ctx.font = "600 7px 'Inter', sans-serif";
  ctx.fillStyle = "#3a3a3a";
  ctx.textAlign = "left";
  ctx.fillText("COMPONENTS", 14, TITLE_H + 22);

  ctx.strokeStyle = "#151515";
  ctx.beginPath();
  ctx.moveTo(14, TITLE_H + 30);
  ctx.lineTo(SIDEBAR_W - 14, TITLE_H + 30);
  ctx.stroke();

  components.forEach((comp, i) => {
    const y = sidebarY(i);
    const hl = s.sidebarHl === i;

    if (hl) {
      rr(ctx, 8, y - 2, SIDEBAR_W - 16, 36, 8);
      ctx.fillStyle = "rgba(243,128,32,0.05)";
      ctx.fill();
      ctx.strokeStyle = "rgba(243,128,32,0.1)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Icon box — matches editor: rounded-lg bg-[#252525]
    const bx = 16, by = y + 4;
    rr(ctx, bx, by, 24, 24, 6);
    ctx.fillStyle = hl ? "rgba(243,128,32,0.1)" : "#191919";
    ctx.fill();
    ctx.strokeStyle = hl ? "rgba(243,128,32,0.2)" : "#222";
    ctx.lineWidth = 0.5;
    ctx.stroke();
    drawIcon(ctx, bx + 12, by + 12, comp.iconType, hl ? 0.85 : 0.5, 4.5);

    // Label
    ctx.font = "500 9.5px 'Inter', sans-serif";
    ctx.fillStyle = hl ? "#ddd" : "#666";
    ctx.textAlign = "left";
    ctx.fillText(comp.label, 46, y + 19);
  });
}

// ════════════════════════════════
// DOT GRID
// ════════════════════════════════

function drawDotGrid(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "rgba(255,255,255,0.012)";
  for (let x = SIDEBAR_W + 14; x < W - 4; x += 20) {
    for (let y = TITLE_H + 14; y < H - 4; y += 20) {
      ctx.beginPath();
      ctx.arc(x, y, 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ════════════════════════════════
// NODES — match CloudNode.tsx style
// ════════════════════════════════

function drawNodes(ctx: CanvasRenderingContext2D, s: AnimState) {
  s.nodes.forEach((node, i) => {
    if (node.opacity <= 0 || node.scale <= 0) return;
    const comp = components[i];
    const ncx = node.x + NODE_W / 2;
    const ncy = node.y + NODE_H / 2;

    ctx.save();
    ctx.translate(ncx, ncy);
    ctx.scale(node.scale, node.scale);
    ctx.translate(-ncx, -ncy);

    // ── Shadow ──
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 25;
    ctx.shadowOffsetY = 6;

    // ── Body: rounded-xl bg-[#161616] ──
    rr(ctx, node.x, node.y, NODE_W, NODE_H, 12);
    ctx.fillStyle = "#161616";
    ctx.fill();

    // Border
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    rr(ctx, node.x, node.y, NODE_W, NODE_H, 12);
    if (node.selected) {
      // Selected: border-[#f38020] + glow
      ctx.strokeStyle = "#f38020";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Outer glow
      rr(ctx, node.x - 3, node.y - 3, NODE_W + 6, NODE_H + 6, 14);
      ctx.strokeStyle = "rgba(243,128,32,0.1)";
      ctx.lineWidth = 4;
      ctx.stroke();
    } else {
      ctx.strokeStyle = "#2a2a2a";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // ── Icon box: w-8 h-8 rounded-lg bg-[#252525] ──
    const ibx = node.x + 12;
    const iby = node.y + (NODE_H - 28) / 2;
    rr(ctx, ibx, iby, 28, 28, 7);
    ctx.fillStyle = node.selected ? "rgba(243,128,32,0.12)" : "#222";
    ctx.fill();
    ctx.strokeStyle = node.selected ? "rgba(243,128,32,0.2)" : "rgba(255,255,255,0.03)";
    ctx.lineWidth = 0.5;
    ctx.stroke();
    drawIcon(ctx, ibx + 14, iby + 14, comp.iconType, node.selected ? 1 : 0.75, 6);

    // ── Label: 13px font-medium text-[#e3e3e3] ──
    ctx.font = "500 11px 'Inter', sans-serif";
    ctx.fillStyle = "#e3e3e3";
    ctx.textAlign = "left";
    ctx.fillText(comp.label, node.x + 46, ncy - 2);

    // ── Category: 10px uppercase text-[#666] ──
    ctx.font = "500 7.5px 'Inter', sans-serif";
    ctx.fillStyle = node.selected ? "rgba(243,128,32,0.6)" : "#555";
    ctx.fillText(comp.category, node.x + 46, ncy + 10);

    ctx.restore();

    // ── Handles: circles with bg-[#1a1a1a] border-2 border-[#f38020] ──
    if (node.scale > 0.85) {
      drawHandle(ctx, ncx, node.y - HANDLE_SIZE / 2 - 1, node.selected);           // top
      drawHandle(ctx, ncx, node.y + NODE_H + HANDLE_SIZE / 2 + 1, node.selected);  // bottom
    }
  });
}

function drawHandle(ctx: CanvasRenderingContext2D, x: number, y: number, active: boolean) {
  const r = HANDLE_SIZE / 2;

  // Glow ring when active
  if (active) {
    ctx.beginPath();
    ctx.arc(x, y, r + 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(243,128,32,0.08)";
    ctx.fill();
  }

  // Outer circle (border)
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = active ? "#f38020" : "#1a1a1a";
  ctx.fill();
  ctx.strokeStyle = "#f38020";
  ctx.lineWidth = active ? 2 : 1.5;
  ctx.stroke();
}

// ════════════════════════════════
// EDGES — dashed orange bezier like the editor
// ════════════════════════════════

function drawEdges(ctx: CanvasRenderingContext2D, s: AnimState) {
  s.edges.forEach((edge) => {
    if (edge.progress <= 0) return;
    const sn = s.nodes[edge.src];
    const tn = s.nodes[edge.tgt];
    if (sn.opacity <= 0 || tn.opacity <= 0) return;

    const x1 = sn.x + NODE_W / 2;
    const y1 = sn.y + NODE_H + HANDLE_SIZE / 2 + 1;
    const x2 = tn.x + NODE_W / 2;
    const y2Full = tn.y - HANDLE_SIZE / 2 - 1;
    const y2 = y1 + (y2Full - y1) * edge.progress;
    const x2p = x1 + (x2 - x1) * edge.progress;

    // Smooth step bezier (vertical S-curve)
    const midY = (y1 + y2) / 2;

    // Glow
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(x1, midY, x2p, midY, x2p, y2);
    ctx.strokeStyle = "rgba(243,128,32,0.05)";
    ctx.lineWidth = 8;
    ctx.stroke();

    // Dashed edge line
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(x1, midY, x2p, midY, x2p, y2);
    ctx.strokeStyle = "rgba(243,128,32,0.45)";
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrow
    if (edge.progress > 0.92) {
      const dy = y2 - midY;
      const dx = x2p - x2p; // essentially vertical arrival
      const angle = Math.atan2(dy || 1, dx);
      const al = 5.5;
      ctx.beginPath();
      ctx.moveTo(x2p, y2);
      ctx.lineTo(x2p - al * Math.cos(angle - 0.5), y2 - al * Math.sin(angle - 0.5));
      ctx.lineTo(x2p - al * Math.cos(angle + 0.5), y2 - al * Math.sin(angle + 0.5));
      ctx.closePath();
      ctx.fillStyle = "rgba(243,128,32,0.55)";
      ctx.fill();
    }

    // Flow particle
    if (edge.progress >= 1) {
      const ft = (s.time * 0.4 + edge.src * 0.35) % 1;
      const fx = bezPt(x1, x1, x2, x2, ft);
      const fy = bezPt(y1, midY, midY, y2Full, ft);
      const alpha = Math.sin(ft * Math.PI) * 0.75;

      // Glow
      const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 10);
      g.addColorStop(0, `rgba(243,128,32,${alpha * 0.25})`);
      g.addColorStop(1, "rgba(243,128,32,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(fx, fy, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(fx, fy, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(243,128,32,${alpha})`;
      ctx.fill();
    }
  });
}

function bezPt(a: number, b: number, c: number, d: number, t: number) {
  const m = 1 - t;
  return m * m * m * a + 3 * m * m * t * b + 3 * m * t * t * c + t * t * t * d;
}

// ════════════════════════════════
// LIVE CONNECTION LINE
// ════════════════════════════════

function drawConnLine(ctx: CanvasRenderingContext2D, s: AnimState) {
  if (s.connLine.opacity <= 0) return;
  const { x1, y1, x2, y2, opacity } = s.connLine;
  const midY = (y1 + y2) / 2;

  // Glow
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.bezierCurveTo(x1, midY, x2, midY, x2, y2);
  ctx.strokeStyle = `rgba(243,128,32,${0.06 * opacity})`;
  ctx.lineWidth = 10;
  ctx.stroke();

  // Dashed
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.bezierCurveTo(x1, midY, x2, midY, x2, y2);
  ctx.strokeStyle = `rgba(243,128,32,${0.55 * opacity})`;
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.setLineDash([]);
}

// ════════════════════════════════
// DRAG GHOST
// ════════════════════════════════

function drawGhost(ctx: CanvasRenderingContext2D, s: AnimState) {
  if (s.dragGhost.opacity <= 0) return;
  const comp = components[s.dragGhost.idx];
  const gx = s.dragGhost.x - NODE_W / 2;
  const gy = s.dragGhost.y - NODE_H / 2;

  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.translate(s.dragGhost.x, s.dragGhost.y);
  ctx.rotate(-0.025);
  ctx.translate(-s.dragGhost.x, -s.dragGhost.y);

  ctx.shadowColor = "rgba(243,128,32,0.12)";
  ctx.shadowBlur = 30;

  rr(ctx, gx, gy, NODE_W, NODE_H, 12);
  ctx.fillStyle = "#161616";
  ctx.fill();
  ctx.strokeStyle = "rgba(243,128,32,0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  // Icon box
  const ibx = gx + 12, iby = gy + (NODE_H - 28) / 2;
  rr(ctx, ibx, iby, 28, 28, 7);
  ctx.fillStyle = "#222";
  ctx.fill();
  drawIcon(ctx, ibx + 14, iby + 14, comp.iconType, 0.65, 6);

  // Label
  ctx.font = "500 11px 'Inter', sans-serif";
  ctx.fillStyle = "#bbb";
  ctx.textAlign = "left";
  ctx.fillText(comp.label, gx + 46, gy + NODE_H / 2 + 4);

  ctx.restore();
}

// ════════════════════════════════
// CURSOR
// ════════════════════════════════

function drawCursor(ctx: CanvasRenderingContext2D, s: AnimState) {
  if (s.cursor.opacity <= 0) return;
  const { x, y, pressing, opacity } = s.cursor;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x, y);
  ctx.scale(pressing ? 0.88 : 1, pressing ? 0.88 : 1);

  ctx.shadowColor = "rgba(0,0,0,0.65)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;

  // Pointer
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 17);
  ctx.lineTo(4.5, 13.5);
  ctx.lineTo(8, 21);
  ctx.lineTo(11, 19.5);
  ctx.lineTo(7.5, 12);
  ctx.lineTo(13, 11.5);
  ctx.closePath();
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 0.6;
  ctx.stroke();

  if (pressing) {
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(243,128,32,0.1)";
    ctx.fill();
  }

  ctx.restore();
}

// ════════════════════════════════
// MINI ICONS (Lucide-like)
// ════════════════════════════════

function drawIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, type: string, alpha: number, sz: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#f38020";
  ctx.fillStyle = "#f38020";
  ctx.lineWidth = 1.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  switch (type) {
    case "network": {
      // Network/VPC: connected boxes
      const s = sz * 0.7;
      // Center box
      rr(ctx, cx - s, cy - s, s * 2, s * 2, 1.5);
      ctx.stroke();
      // Top line + dot
      ctx.beginPath();
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx, cy - s - 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy - s - 4.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
      // Bottom
      ctx.beginPath();
      ctx.moveTo(cx, cy + s);
      ctx.lineTo(cx, cy + s + 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + s + 4.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
      // Left
      ctx.beginPath();
      ctx.moveTo(cx - s, cy);
      ctx.lineTo(cx - s - 3, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - s - 4.5, cy, 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "server": {
      // Server: two stacked rectangles
      const w = sz, h = sz * 0.45;
      rr(ctx, cx - w, cy - h - 1, w * 2, h, 2);
      ctx.stroke();
      rr(ctx, cx - w, cy + 1, w * 2, h, 2);
      ctx.stroke();
      // Dots
      ctx.beginPath();
      ctx.arc(cx + w - 3, cy - h / 2 - 1, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + w - 3, cy + h / 2 + 1, 1, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "globe": {
      // Globe
      ctx.beginPath();
      ctx.arc(cx, cy, sz, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - sz, cy);
      ctx.lineTo(cx + sz, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, sz * 0.45, sz, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case "shield": {
      // Shield
      const w = sz * 0.8, h = sz * 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - h);
      ctx.lineTo(cx + w, cy - h * 0.55);
      ctx.lineTo(cx + w, cy + h * 0.1);
      ctx.quadraticCurveTo(cx, cy + h, cx, cy + h);
      ctx.quadraticCurveTo(cx, cy + h, cx - w, cy + h * 0.1);
      ctx.lineTo(cx - w, cy - h * 0.55);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case "database": {
      // Cylinder
      ctx.beginPath();
      ctx.ellipse(cx, cy - sz + 2, sz, 2.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - sz, cy - sz + 2);
      ctx.lineTo(cx - sz, cy + sz - 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + sz, cy - sz + 2);
      ctx.lineTo(cx + sz, cy + sz - 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy + sz - 2, sz, 2.5, 0, 0, Math.PI);
      ctx.stroke();
      break;
    }
    case "storage": {
      // Bucket
      ctx.beginPath();
      ctx.moveTo(cx - sz, cy - sz + 1);
      ctx.lineTo(cx + sz, cy - sz + 1);
      ctx.lineTo(cx + sz - 1, cy + sz);
      ctx.lineTo(cx - sz + 1, cy + sz);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - sz, cy - 1);
      ctx.lineTo(cx + sz, cy - 1);
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

// ─── Round rect ───
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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
