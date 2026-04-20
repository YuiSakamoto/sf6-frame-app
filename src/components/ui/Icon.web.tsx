import { createElement } from "react";
import type { ReactElement } from "react";

export type IconName =
  | "list"
  | "flash"
  | "search"
  | "settings-outline"
  | "chevron-back";

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

type SvgPaths = {
  viewBox: string;
  // Either `paths` (stroked outline) or `fill` (filled path)
  stroke?: string[];
  fill?: string[];
};

// Ionicons-compatible paths. viewBox kept at 512 to match Ionicons SVG source.
const ICONS: Record<IconName, SvgPaths> = {
  list: {
    viewBox: "0 0 512 512",
    stroke: [
      "M160 144h288M160 256h288M160 368h288",
      "M80 128a16 16 0 1 0 0 32 16 16 0 0 0 0-32zM80 240a16 16 0 1 0 0 32 16 16 0 0 0 0-32zM80 352a16 16 0 1 0 0 32 16 16 0 0 0 0-32z",
    ],
  },
  flash: {
    viewBox: "0 0 512 512",
    fill: [
      "M315.27 33c-1.37 0-16 1.06-16.37 15.74L290.42 208a8 8 0 0 1-8 7.59H177.71a16.13 16.13 0 0 0-13.84 7.66 16.6 16.6 0 0 0-.94 15.85C182.28 279.37 276.8 470.63 276.8 470.63c.66 1.32 5.81 10.37 15 10.37a16.88 16.88 0 0 0 3.73-.42c10.58-2.47 13.4-12.18 13.4-17V304.41a8 8 0 0 1 8-7.59H421.19a16.13 16.13 0 0 0 13.84-7.66 16.6 16.6 0 0 0 .94-15.85C416.22 232.63 322.07 42.78 321.61 41.85A16.61 16.61 0 0 0 315.27 33Z",
    ],
  },
  search: {
    viewBox: "0 0 512 512",
    stroke: [
      "M221.09 64a157.09 157.09 0 1 0 157.09 157.09A157.1 157.1 0 0 0 221.09 64Z",
      "M338.29 338.29 448 448",
    ],
  },
  "settings-outline": {
    viewBox: "0 0 512 512",
    stroke: [
      "M262.29 192.31a64 64 0 1 0 57.4 57.4 64.13 64.13 0 0 0-57.4-57.4ZM416.39 256a154.34 154.34 0 0 1-1.53 20.79l45.21 35.46a10.81 10.81 0 0 1 2.45 13.75l-42.77 74a10.81 10.81 0 0 1-13.14 4.59l-44.9-18.08a16.11 16.11 0 0 0-15.17 1.75A164.48 164.48 0 0 1 325 400.8a15.94 15.94 0 0 0-8.82 12.14l-6.73 47.89a11.08 11.08 0 0 1-10.68 9.17h-85.54a11.11 11.11 0 0 1-10.69-8.87l-6.72-47.82a16.07 16.07 0 0 0-9-12.22 155.3 155.3 0 0 1-21.46-12.57 16 16 0 0 0-15.11-1.71l-44.89 18.07a10.81 10.81 0 0 1-13.14-4.58l-42.77-74a10.8 10.8 0 0 1 2.45-13.75l38.21-30a16.05 16.05 0 0 0 6-14.08c-.36-4.17-.58-8.33-.58-12.5s.21-8.27.58-12.35a16 16 0 0 0-6.07-13.94l-38.19-30A10.81 10.81 0 0 1 49.48 186l42.77-74a10.81 10.81 0 0 1 13.14-4.59l44.9 18.08a16.11 16.11 0 0 0 15.17-1.75A164.48 164.48 0 0 1 187 111.2a15.94 15.94 0 0 0 8.82-12.14l6.73-47.89A11.08 11.08 0 0 1 213.23 42h85.54a11.11 11.11 0 0 1 10.69 8.87l6.72 47.82a16.07 16.07 0 0 0 9 12.22 155.3 155.3 0 0 1 21.46 12.57 16 16 0 0 0 15.11 1.71l44.89-18.07a10.81 10.81 0 0 1 13.14 4.58l42.77 74a10.8 10.8 0 0 1-2.45 13.75l-38.21 30a16.05 16.05 0 0 0-6.05 14.08c.33 4.14.55 8.3.55 12.47Z",
    ],
  },
  "chevron-back": {
    viewBox: "0 0 512 512",
    stroke: ["M328 112 184 256l144 144"],
  },
};

export function Icon({
  name,
  size = 24,
  color = "#fff",
}: IconProps): ReactElement {
  const icon = ICONS[name];
  const children: ReactElement[] = [];

  if (icon.fill) {
    icon.fill.forEach((d, i) =>
      children.push(createElement("path", { key: `f${i}`, d, fill: color })),
    );
  }
  if (icon.stroke) {
    icon.stroke.forEach((d, i) =>
      children.push(
        createElement("path", {
          key: `s${i}`,
          d,
          fill: "none",
          stroke: color,
          strokeWidth: 32,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }),
      ),
    );
  }

  return createElement(
    "svg",
    {
      width: size,
      height: size,
      viewBox: icon.viewBox,
      xmlns: "http://www.w3.org/2000/svg",
      "aria-hidden": "true",
      focusable: "false",
      style: { display: "inline-block", flexShrink: 0 },
    },
    ...children,
  );
}
