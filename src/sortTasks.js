import _ from "lodash";
import { parseTaskString } from "./parseTaskString";
import {
  processPoints,
  classifyPoints,
  calculateCentroid
} from "./quads/index";
export const round = (num, amount = 3) => Number(num.toFixed(amount));

export const MAX_TIME = 500;
// const format = (date) => {
//   return date
//     ? new Intl.DateTimeFormat({ dateStyle: "medium" }).format(new Date(date))
//     : date;
// };

export function mod(delta, age) {
  // https://codepen.io/oscarsaharoy/full/eYggrme
  return delta;
}

export function getDistance(position, ...rest) {
  let pos = position;
  if (typeof position === "number") {
    pos = [position, ...rest];
  } else if (_.isPlainObject(position)) {
    pos = Object.values(position);
  }

  return Math.sqrt(pos.reduce((sum, val) => sum + val ** 2, 0));
}

function applyAgeMod(task) {
  if (task.tags.timing !== "none") {
    return task;
  }

  // task.position.timing;

  // const valueDict = {
  //   re: 3,
  //   r: 4,
  //   pr: 5,
  //   none: 6
  // };
  try {
    const now = Date.now();
    const age = now - task.created_on;
    const ageInDays = parseInt(Math.floor(age / 1000 / 60 / 60 / 24));
    task.rawAge = age;
    task.ageMod = Number((ageInDays / 4).toFixed(2));
    task.position.timing += Number((ageInDays / 4).toFixed(2));
    return task;
  } catch (e) {
    console.log(task);
    throw e;
  }
}

const compareValue = (a, b) => {
  return a.position.category - b.position.category;
};

const compareDistances = (a, b) => {
  const distanceA = getDistance(a.position);
  const distanceB = getDistance(b.position);

  return distanceA - distanceB;
};

export function sortTasks(tasks, state) {
  if (typeof tasks === "string") {
    tasks = tasks
      .replace(/### \d/g, "")
      .replace(/  /g, " ")
      .split("\n")
      .filter(Boolean);
  }
  const taskList = tasks
    .filter((s) => !s.startsWith("###"))
    .map(parseTaskString(state))
    .map(applyAgeMod)
    .map((task) => ({
      x: task.position.timing * 2,
      y: task.position.category * 10,
      ...task,
      distance: getDistance(task.position)
    }))
    // .sort(compareValue);
    .sort(compareDistances);
  //   .sort(compareDistances)
  const positioning = taskList.map((task) => ({
    x: task.position.timing * 2,
    y: task.position.category * 10,
    ...task,
    distance: getDistance(task.position)
  }));

  const centroid = calculateCentroid(taskList);
  const results = classifyPoints(taskList, centroid).sort((a, b) => {
    return a.quadrant - b.quadrant || compareDistances(a, b);
  });

  processPoints(taskList);

  console.log(
    "%cSO WHAT'S MORE IMPORTANT, DISTANCE FROM CENTROID OR DISTANCE FROM 0",
    "background: tomato; color: white; padding: 4px 6px;"
  );

  console.table(
    results
      .map(({ str, x, y, quadrant, position, distance, ...rest }) => ({
        str,
        // x,
        // y,
        // position: `${x}, ${y}`,
        ...position,
        distance: Number(distance.toFixed(2)),
        quadrant,
        ...rest
      }))
      .reduce((acc, { str, id, created_on, rawAge, ageMod, ...x }) => {
        acc[str] = x;
        return acc;
      }, {})
  );

  // console.log(parsedTime);
  // const furthest = parsedTime
  //   .map((t) => t.urgency)
  //   .filter((u) => u !== MAX_TIME)
  //   .sort()
  //   .at(-1);
  // const mappedTasks = parsedTime
  //   .map((task) => {
  //     const x =
  //       task.urgency === MAX_TIME
  //         ? 4
  //         : linearScale(task.urgency, 0, furthest * 1.5, 0, 4);

  //     const y = task.tagsPosition; //Math.abs(task.tagsPosition - getTagDictHighestValue());
  //     try {
  //       return Object.assign(task, {
  //         distance: round(getDistance(x, y)),
  //         "x (urgency)": round(x),
  //         "y (tag rank)": round(y / 2),
  //         pos: { x, y }
  //       });
  //     } catch (e) {
  //       // console.log(task);
  //       throw e;
  //     }
  //   })
  //   .sort((a, b) => a.distance - b.distance);
  //console.log(mappedTasks.map((t) => t.dueDate + ` ${t.str.split(" ")[0]}`));

  // console.log(taskList.filter((t) => Array.isArray(t.position.category)));

  return results; // .map((t) => t.str).join("\n");
}
