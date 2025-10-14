import { DiscordAuthData } from "./talkingbot";

export function getTimeDifference(startDate: Date, endDate: Date): string {
  const timeDifference = endDate.getTime() - startDate.getTime();
  const years = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 365));
  const remainingTime = timeDifference % (1000 * 60 * 60 * 24 * 365);
  const months = Math.floor(remainingTime / (1000 * 60 * 60 * 24 * 30));
  const remainingTime2 = remainingTime % (1000 * 60 * 60 * 24 * 30);
  const days = Math.floor(remainingTime2 / (1000 * 60 * 60 * 24));
  const remainingTime3 = remainingTime2 % (1000 * 60 * 60 * 24);
  const hours = Math.floor(remainingTime3 / (1000 * 60 * 60));
  const remainingTime4 = remainingTime3 % (1000 * 60 * 60);
  const minutes = Math.floor(remainingTime4 / (1000 * 60));
  const remainingTime5 = remainingTime4 % (1000 * 60);
  const seconds = Math.floor(remainingTime5 / 1000);

  let timeString = "";
  if (years != 0) timeString += `${years} years `;
  if (months != 0) timeString += `${months} months `;
  if (days != 0) timeString += `${days} days `;
  if (hours != 0) timeString += `${hours} hours `;
  if (minutes != 0) timeString += `${minutes} minutes `;
  if (seconds != 0) timeString += `${seconds} seconds`;
  return timeString;
}
export function milliSecondsToString(timeDifference: number): string {
  const hours = Math.floor(timeDifference / (1000 * 60 * 60));
  const remainingTime4 = timeDifference % (1000 * 60 * 60);
  const minutes = Math.floor(remainingTime4 / (1000 * 60));
  const remainingTime5 = remainingTime4 % (1000 * 60);
  const seconds = Math.floor(remainingTime5 / 1000);

  let timeString = "";
  if (hours != 0) timeString += `${hours} hours `;
  if (minutes != 0) timeString += `${minutes} minutes `;
  if (seconds != 0) timeString += `${seconds} seconds`;
  return timeString;
}

export async function replaceAsync(
  str: string,
  regex: RegExp,
  asyncFn: Function,
) {
  const promises: string[] = [];
  str.replace(regex, (full, ...args) => {
    promises.push(asyncFn(full, ...args));
    return full;
  });
  const data = await Promise.all(promises);
  return str.replace(regex, () => data.shift() ?? "");
}

export function getSuffix(i: number) {
  var j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}

export function getRandomElement<T>(array: T[]): T {
  if (array.length < 2) return array[0];
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}
function removeByIndex(str: string, index: number): string {
  return str.slice(0, index) + str.slice(index + 1);
}

export function removeByIndexToUppercase(
  str: string,
  indexes: number[],
): string {
  let deletedChars = 0;
  indexes.forEach((index) => {
    let i = index - deletedChars;
    while (
      !isNaN(parseInt(str.charAt(i), 10)) ||
      str.charAt(i) !== str.charAt(i).toUpperCase()
    ) {
      str = removeByIndex(str, i);
      deletedChars++;
    }
  });
  return str;
}
export function hashMaptoArray<Key, Value>(
  map: Map<Key, Value>,
): { key: Key; value: Value }[] {
  const array: { key: Key; value: Value }[] = [];
  map.forEach((value, key) => {
    array.push({ key, value });
  });
  return array;
}
export function arraytoHashMap<Key, Value>(
  array: {
    key: Key;
    value: Value;
  }[],
): Map<Key, Value> {
  const map = new Map<Key, Value>();
  array.forEach((element) => {
    map.set(element.key, element.value);
  });
  return map;
}

export async function getDiscordUserId(data: DiscordAuthData): Promise<string> {
  const result = await fetch("https://discord.com/api/users/@me", {
    headers: {
      authorization: `${data.token_type} ${data.access_token}`,
    },
  });
  const userData = await result.json();
  return userData.id;
}
export function isDiscordAuthData(obj: any): obj is DiscordAuthData {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.token_type === "string" &&
    typeof obj.access_token === "string" &&
    typeof obj.expires_in === "number" &&
    typeof obj.refresh_token === "string" &&
    typeof obj.scope === "string"
  );
}

export function replaceMap(
  map: Map<string, string>,
  input: string,
  replacement: (match: string) => string,
): string {
  if (map.size === 0) return input;

  // Escape special characters for regex
  const escapeRegex = (str: string) =>
    str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

  // Create a regex pattern from the map keys
  const pattern = Array.from(map.keys()).map(escapeRegex).join("|");

  const regex = new RegExp(`(?<!\\w)(${pattern})(?!\\w)`, "g");

  return input.replace(regex, (match) => {
    const value = map.get(match);
    return value ? replacement(value) : match;
  });
}
export function toPascalCase(input: string): string {
  return input
    .replace(/[_\-\s]+/g, " ") // replace separators with spaces
    .trim() // remove leading/trailing spaces
    .split(/\s+/) // split by spaces
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}
