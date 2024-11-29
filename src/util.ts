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
  const promises = [];
  str.replace(regex, (full, ...args) => {
    promises.push(asyncFn(full, ...args));
    return full;
  });
  const data = await Promise.all(promises);
  return str.replace(regex, () => data.shift());
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

export function getRandomElement(array: string[]): string {
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
