/**
 * Paint colours of the home page car. `hex` is the lit body colour (also the swatch).
 * `scripts/car-colours.ts` renders `public/home/suv/<id>.webp` for each one, so re-run it after a change here.
 * The photo itself is light grey: that colour keeps the body as photographed, and is the default.
 * The roof is painted `carRoofHex` (gloss black) in every colour.
 */
export const carRoofHex = "#0e0f11";

export const carColours = [
  { id: "lightGrey", hex: "#c4c7cb" },
  { id: "white", hex: "#eeefec" },
  { id: "black", hex: "#0e0f11" },
  { id: "red", hex: "#a8121f" },
  { id: "blue", hex: "#1d4fb8" },
  { id: "orange", hex: "#d85b14" },
  { id: "green", hex: "#1f5b3d" },
  { id: "gold", hex: "#b8913e" },
] as const;

export type CarColourId = (typeof carColours)[number]["id"];

export const photoCarColour: CarColourId = "lightGrey";

export function carImage(id: CarColourId): string {
  return `/home/suv/${id}.webp`;
}
