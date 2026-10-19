import { spawnSync } from "node:child_process";

export function hasAge() {
  return spawnSync("age", ["--version"], { encoding: "utf8" }).status === 0;
}
