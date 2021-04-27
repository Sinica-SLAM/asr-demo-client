export function timeFormat(date: Date): string {
  return `${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}:
        ${date
          .getSeconds()
          .toString()
          .padStart(2, "0")}`;
}
