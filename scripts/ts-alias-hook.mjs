import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();

function tryFile(absBase) {
  const candidates = [
    absBase,
    `${absBase}.ts`,
    `${absBase}.tsx`,
    `${absBase}.js`,
    `${absBase}.mjs`,
    path.join(absBase, "index.ts"),
    path.join(absBase, "index.tsx"),
    path.join(absBase, "index.js"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return pathToFileURL(candidate).href;
    }
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const resolved = tryFile(path.join(root, specifier.slice(2)));
    if (resolved) {
      return { shortCircuit: true, url: resolved };
    }
  }

  if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    context.parentURL
  ) {
    const parentDir = path.dirname(
      new URL(context.parentURL).pathname.replace(/^\/([A-Za-z]:)/, "$1"),
    );
    // Windows: file URL path may start with /C:/
    let parentPath;
    try {
      parentPath = path.dirname(new URL(context.parentURL).pathname);
      if (/^\/[A-Za-z]:\//.test(parentPath)) {
        parentPath = parentPath.slice(1);
      }
      parentPath = decodeURIComponent(parentPath);
    } catch {
      parentPath = parentDir;
    }
    const resolved = tryFile(path.resolve(parentPath, specifier));
    if (resolved) {
      return { shortCircuit: true, url: resolved };
    }
  }

  return nextResolve(specifier, context);
}
