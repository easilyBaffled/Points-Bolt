import produce, { current } from "immer";

const aliasSectionMatcher = /(?<=## Aliases\n\n)(.*?)(?=\n\n)/s;
const aliasMatcher =
  /#(?<alias>\w+) (?<firstDate>\d+\/\d+)(-?(?<lastDate>\d+\/\d+))?/s;

export const getAlias = (pointsMarkdown) => {
  return pointsMarkdown
    .match(aliasSectionMatcher)[0]
    .trim()
    .replaceAll("|", "")
    .split("\n")
    .slice(2)
    .map((s) => s.trim().replace(/ +/, " "))
    .filter(Boolean);
};

const isShortHand = (date) => {
  if (date instanceof Date) return false;
  return typeof date === "string" && /\d+\/\d+/.test(date);
};

const shortHandToDate = (date) => {
  const year = new Date().getFullYear();
  return new Date(`${date}/${year}`);
};

export const getDaysUntil = (date) => {
  const endDate = shortHandToDate(date);
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

  return Math.round(Math.abs((now - endDate) / oneDay));
};

export const dateToShortHand = (date) =>
  date.toLocaleDateString("en-US").replace(/(\/\d+)$/, "");

export function compareDates(date, targetDate) {
  const a = (isShortHand(date) ? shortHandToDate(date) : date).getTime();
  const b = (
    isShortHand(targetDate) ? shortHandToDate(targetDate) : targetDate
  ).getTime();

  return a - b;
}

export function isBefore(date, targetDate) {
  return compareDates(date, targetDate) < 0;
}

export function isOn(date, targetDate) {
  return compareDates(date, targetDate) === 0;
}

export function isAfter(date, startDate, endDate) {
  return compareDates(date, endDate) > 0;
}

export function isBetween(date, startDate, endDate) {
  return compareDates(date, startDate) > 0 && compareDates(date, endDate) < 0;
}

export function parsedToString({ alias, firstDate, lastDate, daysUntil }) {
  return `| #${alias} | ${dateToShortHand(firstDate)}-${dateToShortHand(
    lastDate
  )} | ${daysUntil} days until |`;
}

export function parseAlias(alises) {
  const year = new Date().getFullYear();

  const res = alises.reduce((dict, a) => {
    const { alias, firstDate, lastDate } = a.match(aliasMatcher)?.groups ?? {};

    dict[alias] = {
      alias,
      firstDate: new Date(`${firstDate}/${year}`),
      lastDate:
        new Date(`${lastDate}/${year}`) ?? new Date(`${firstDate}/${year}`),
      daysUntil: getDaysUntil(firstDate)
    };

    return dict;
  }, {});

  return res;
}
