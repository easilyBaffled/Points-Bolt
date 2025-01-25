import * as d3 from "d3";
import { tasks } from "./tasks";
import "./styles.css";
import { getTagDictHighestValue } from "./taggingDict";
import { linearScale } from "./linearScale";
import { nodes } from "./taggingNodes";
import "./quads/index";
import "./core";

import {
  createNodeTagTree,
  prettyPrintCatTree,
  createTagTree,
  createScoreTable,
  createTree
} from "./createTagTree";
import { sortTasks } from "./sortTasks";

// console.log(prettyPrintCatTree(createNodeTagTree(tasks)));
