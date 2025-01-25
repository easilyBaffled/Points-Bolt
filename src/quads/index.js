export function processPoints(points) {
  //   const input = document.getElementById("pointsInput").value;
  //   const points = input.split("\n").map((line) => {
  //     const [x, y] = line.split(",").map(Number);
  //     return { x, y };
  //   });

  points.forEach((p) => {
    if (isNaN(p.x) || isNaN(p.y)) {
      console.error(
        `Invalid input! ${p.x} is ${typeof p.x} and ${
          p.y
        } is ${typeof p.y}. Ensure points are formatted as x,y pairs. ${
          p.index
        }`
      );
    }
  });
  if (points.some((p) => isNaN(p.x) || isNaN(p.y))) {
    return;
  }

  const centroid = calculateCentroid(points);

  renderVisualization(points, centroid);
}

export function calculateCentroid(points) {
  const total = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  );
  return { x: total.x / points.length, y: total.y / points.length };
}

export function classifyPoints(points, centroid) {
  return points.map((point) => {
    let quadrant;
    if (point.x >= centroid.x && point.y >= centroid.y) quadrant = 4;
    else if (point.x < centroid.x && point.y >= centroid.y) quadrant = 3;
    else if (point.x < centroid.x && point.y < centroid.y) quadrant = 1;
    else quadrant = 2;
    return { ...point, quadrant };
  });
}

// export function displayResults(pointsWithQuadrants, centroid) {
//   const resultsDiv = document.getElementById("results");
//   resultsDiv.innerHTML = `<p>Centroid: (${centroid.x.toFixed(
//     2
//   )}, ${centroid.y.toFixed(2)})</p>`;

//   const list = document.createElement("ul");
//   pointsWithQuadrants.forEach((p) => {
//     const item = document.createElement("li");
//     item.textContent = `Point (${p.x}, ${p.y}) is in Quadrant ${p.quadrant}`;
//     list.appendChild(item);
//   });

//   resultsDiv.appendChild(list);
// }

function getToolTipText({ distance, position: { timing, category }, str }) {
  return `
      ${str}
      distance: ${distance}
      timing: ${timing}
      category: ${category}
      `;
}

export function renderVisualization(points, centroid) {
  const svg = document.getElementById("visualization");
  const container = document.getElementById("container"); // Assume a parent container exists

  svg.innerHTML = ""; // Clear previous content if needed

  const max = points.reduce(
    (acc, p) => {
      acc.x = Math.max(acc.x, p.x);
      acc.y = Math.max(acc.y, p.y);
      return acc;
    },
    { x: 0, y: 0 }
  );
  const dist = Math.max(max.x, max.y);
  const viewBox = [
    (centroid.x - max.x) / 2,
    (centroid.y - max.y) / 2,
    max.x + 5,
    max.y + 5
  ];

  console.log({ centroid, max, viewBox });

  svg.setAttribute("viewBox", viewBox);
  const scale = 1;

  // Create and render point list
  const listContainer = document.createElement("div");
  listContainer.id = "points-list";
  listContainer.className = "points-list-container";
  listContainer.style.display = "inline-block";
  listContainer.style.verticalAlign = "top";

  const list = document.createElement("ul");
  points.forEach((p, index) => {
    const listItem = document.createElement("li");

    const {
      str,
      position: { timing, category }
    } = p;

    listItem.textContent = `(${timing}, ${category}): ${str.slice(
      0,
      str.search(/ [^#]/) + 12
    )}`;
    listItem.dataset.index = index;
    listItem.style.cursor = "pointer";

    // Hover effects for list items
    listItem.addEventListener("mouseenter", () =>
      applyHoverEffect(index, true, p)
    );
    listItem.addEventListener("mouseleave", () =>
      applyHoverEffect(index, false)
    );

    list.appendChild(listItem);
  });

  listContainer.appendChild(list);
  container.appendChild(listContainer);

  // Draw points
  points.forEach((p, index) => {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", p.x * scale);
    circle.setAttribute("cy", p.y * scale);
    circle.setAttribute("r", 1);
    circle.setAttribute("fill", "blue");
    circle.dataset.index = index;

    // Hover effects for SVG points
    circle.addEventListener("mouseenter", () =>
      applyHoverEffect(index, true, p)
    );
    circle.addEventListener("mouseleave", () => applyHoverEffect(index, false));

    svg.appendChild(circle);
  });

  // Draw centroid
  const centroidCircle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  centroidCircle.setAttribute("cx", centroid.x * scale);
  centroidCircle.setAttribute("cy", centroid.y * scale);
  centroidCircle.setAttribute("r", 1);
  centroidCircle.setAttribute("fill", "red");
  svg.appendChild(centroidCircle);

  // Helper function to create a line
  function createLine(x1, y1, x2, y2) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "black");
    line.setAttribute("stroke-dasharray", 0.5);
    return line;
  }

  // Draw quadrant lines through centroid
  const lines = [
    createLine(centroid.x * scale, -500, centroid.x * scale, 500),
    createLine(-500, centroid.y * scale, 500, centroid.y * scale)
  ];

  lines.forEach((line) => {
    svg.appendChild(line);
  });

  // Utility function for hover effects
  function applyHoverEffect(index, isHovering, p) {
    if (p) {
      console.log(p);
    }
    const listItem = document.querySelector(`li[data-index='${index}']`);
    const circle = document.querySelector(`circle[data-index='${index}']`);

    if (isHovering) {
      if (listItem) listItem.style.fontWeight = "bold";
      if (circle) circle.setAttribute("fill", "green");
    } else {
      if (listItem) listItem.style.fontWeight = "normal";
      if (circle) circle.setAttribute("fill", "blue");
    }
  }
}
