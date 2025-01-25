import _ from "lodash";
import moment from "moment";
import { splitTagsAndTask } from "./splitTaskString";
import { getTaskPosition } from "./taggingDict";
import { linearScale } from "./linearScale";
import { dict } from "./catDict";
import { dateToShortHand } from "./parsers/alias";
import * as chrono from "chrono-node";

export function zeroTime(date = new Date()) {
  return new Date(date).setHours(0, 0, 0, 0);
}

export function convertMiliseconds(miliseconds, format) {
  var days, hours, minutes, seconds, total_hours, total_minutes, total_seconds;

  total_seconds = parseInt(Math.floor(miliseconds / 1000));
  total_minutes = parseInt(Math.floor(total_seconds / 60));
  total_hours = parseInt(Math.floor(total_minutes / 60));
  days = parseInt(Math.floor(total_hours / 24));

  seconds = parseInt(total_seconds % 60);
  minutes = parseInt(total_minutes % 60);
  hours = parseInt(total_hours % 24);

  switch (format) {
    case "s":
      return total_seconds;
    case "m":
      return total_minutes;
    case "h":
      return total_hours;
    case "d":
      return days;
    default:
      return { d: days, h: hours, m: minutes, s: seconds };
  }
}

const dot = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);

export function parseTags(tagsString, aliasDict) {
  let [timing, ...categories] = tagsString.replace(/#/g, "").split(" ");

  if (timing.startsWith("before")) {
    const key = timing.split("-")[1];

    const date = aliasDict[key].firstDate;
    date.setDate(date.getDate() - 1);
    timing = `by-${dateToShortHand(date)}`;
  }
  if (timing.startsWith("on") && timing.split("-")[1] in aliasDict) {
    const date = aliasDict[key].firstDate;
    date.setDate(date.getDate());
    timing = `on-${dateToShortHand(date)}`;
  }

  return {
    timing,
    categories
  };
}

function convertDateToValue(timing) {
  const { qualifier, date } =
    timing.match(/(?<qualifier>on|by)?-?(?<date>.+)/)?.groups ?? {};

  const parsedDate = chrono.casual.parseDate(date, new Date(), {
    forwardDate: true
  });

  if (timing.startsWith("on-")) {
    return valueDict.none;
  }

  const dueDate =
    date === "tbd" || date === "today" ? Date.now() : zeroTime(parsedDate);
  // console.log({
  //   parsedDate,
  //   dueDate,
  //   timing,
  //   minus: zeroTime(parsedDate) - zeroTime(),
  //   converted: convertMiliseconds(zeroTime(parsedDate) - zeroTime(), "d")
  // });
  return convertMiliseconds(zeroTime(parsedDate) - zeroTime(), "d");
}

const valueDict = {
  re: 3,
  r: 4,
  pr: 5,
  none: 6
};

export function deriveValueFromTimingTag(timing) {
  if (
    timing.startsWith("on") ||
    timing.startsWith("by") ||
    timing === "today"
  ) {
    return convertDateToValue(timing);
  }

  return valueDict[timing];
}

export function getCategoryVector(categories) {
  let vector = [];
  let acc = dict;
  for (const cat of categories) {
    if (!acc[cat]) {
      console.warn(
        `Cannot find ${cat} in the dictonary folllowing ${categories.join(
          " -> "
        )}.`
        //  At ${JSON.stringify(acc)}
      );
      vector.push(10);
      return vector;
    }
    vector.push(Object.keys(acc).findIndex((v) => v === cat));
    acc = acc[cat];
  }

  const mods = [1, 0.1, 0.01, 0.001];

  try {
    return Number(dot(mods.slice(0, vector.length), vector).toFixed(2));
  } catch (e) {
    console.log(categories);
    throw e;
  }
}

export const parseTaskString = (state) => (taskString) => {
  const [tagStrings, taskStr] = splitTagsAndTask(taskString);

  const tags = parseTags(tagStrings, state.alias);

  const existingTask = JSON.parse(localStorage.getItem(taskStr.trim()));

  let baseTask = {};
  let category;
  try {
    category = getCategoryVector(tags.categories);
  } catch (e) {
    console.log(taskString, tags.categories);
    throw e;
  }

  if (existingTask && _.isEqual(existingTask.tags, tags)) {
    if (Array.isArray(existingTask.position.category)) {
      existingTask.position.category = category;
      localStorage.setItem(existingTask.id, JSON.stringify(existingTask));
    }
    if (
      existingTask.tags.timing ===
      "on-" +
        moment()
          .add(+(new Date().getHours() > 12), "days")
          .format("dddd")
          .toLowerCase()
    ) {
      existingTask.str = existingTask.str.replace(
        existingTask.tags.timing,
        "today"
      );

      existingTask.tags.timing = "today";
    }

    return existingTask;
  }
  try {
    baseTask = {
      tags,
      position: {
        timing: deriveValueFromTimingTag(tags.timing),
        category
      },
      id: taskStr.trim(),
      str: taskString,
      created_on: zeroTime()
    };
  } catch (e) {
    console.log(tags, taskStr);
    console.error(e);
  }

  localStorage.setItem(baseTask.id, JSON.stringify(baseTask));
  if (_.isEmpty(baseTask)) {
    console.log(taskString, _.isEmpty(baseTask));
  }

  return baseTask;
};
