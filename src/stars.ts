import fs from "node:fs";

export interface Star {
  name: string;
  radius: number;
}

const stars: Star[] = JSON.parse(fs.readFileSync("./stars.json", "utf-8"));

export function findClosestStar(distance: number): Star {
  let foundStar: Star;
  for (const star of stars) {
    // multiply by 2 to find the diameter
    if (star.radius * 2 > distance) {
      foundStar = star;
      break;
    }
  }
  return foundStar;
}
export function metersToSolarRadii(meters: number) {
  const solarRadiusInMeters = 695700000;

  const solarRadii = meters / solarRadiusInMeters;

  return solarRadii;
}
export function solarRadiiToMeter(solarRadii: number) {
  const solarRadiusInMeters = 695700000;

  const meters = solarRadii * solarRadiusInMeters;

  return meters;
}
