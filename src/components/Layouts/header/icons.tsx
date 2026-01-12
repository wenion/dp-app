const getIcon = (size: number | undefined = 128) =>  {
  const VIEW = 24;
  const s = size / VIEW;

  const COLOR_SKY = "#0EA5E9";
  const COLOR_VIOLET = "#8B5CF6";
  const COLOR_AMBER = "#F59E0B";
  const COLOR_GREEN = "#22c55e";

  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);

  const grad = ctx.createLinearGradient(0, 0, size, 0);
  grad.addColorStop(0, COLOR_SKY);  // sky-500
  grad.addColorStop(0.5, COLOR_VIOLET); // violet-500
  grad.addColorStop(1, COLOR_AMBER);  // amber-500
  ctx.strokeStyle = grad;

  const strokeWidth = 1.5 * s;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const X = (x: number) => x * s;
  const Y = (y: number) => y * s;

  // draw circular border
  ctx.beginPath();
  ctx.arc(X(11), Y(11), 10 * s, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(X(22), Y(22));
  ctx.lineTo(X(18.5), Y(18.5));
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(X(5), Y(6));
  ctx.lineTo(X(5), Y(14));

  ctx.arcTo(X(5), Y(16), X(7), Y(16), 2 * s);
  ctx.lineTo(X(17), Y(16));
  ctx.stroke();

  const dotR = Math.max(0.6 * s, 1); // ensure at least 1px-ish

  const dots: Array<[number, number]> = [
    [9, 7.5],
    [11.5, 10.5],
    [15.5, 6.5],
    [7.5, 11.5],
    [14.5, 12.5],
  ];

  for (const [cx, cy] of dots) {
    ctx.beginPath();
    ctx.arc(X(cx), Y(cy), dotR, 0, Math.PI * 2);
    ctx.fillStyle = COLOR_VIOLET;
    ctx.fill();
  }

  return ctx.getImageData(0, 0, size, size);
}

import { useEffect, useRef } from "react";

export function Icon({
  size = 36,
}: {
  size?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let imageData: ImageData;

    imageData = getIcon(size);

    ctx.clearRect(0, 0, size, size);
    ctx.putImageData(imageData, 0, 0);
  }, [size]);

  return (
    <canvas
      ref={ref}
      className="rounded-2xl"
      style={{ width: size, height: size }}
    />
  );
}