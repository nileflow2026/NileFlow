#!/usr/bin/env node
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import fs from "fs";
import path from "path";

// --- config ---
const ROOT = path.resolve(process.argv[2] || "app");
const exts = [".js", ".jsx", ".ts", ".tsx"];

let fixed = 0;
let alreadyValid = 0;
let suspicious = 0;

// --- utils ---
function scanFile(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  let ast;
  try {
    ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });
  } catch (err) {
    console.error("⚠️ Parse error:", filePath, err.message);
    suspicious++;
    return;
  }

  let hasDefault = false;
  let onlyTypeExports = true;

  traverse(ast, {
    ExportDefaultDeclaration(path) {
      hasDefault = true;
      onlyTypeExports = false;
    },
    ExportNamedDeclaration(path) {
      if (path.node.exportKind !== "type") {
        onlyTypeExports = false;
      }
    },
  });

  if (hasDefault) {
    alreadyValid++;
  } else if (onlyTypeExports) {
    // skip files that only export types
    // treat them as non-suspicious
  } else {
    suspicious++;
    console.log("🚩 No default export:", filePath);
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full);
    } else if (exts.includes(path.extname(entry))) {
      scanFile(full);
    }
  }
}

// --- run ---
walk(ROOT);

console.log("\n=== Audit Summary ===");
console.log(`✔ Already valid: ${alreadyValid}`);
console.log(`🚩 Suspicious:   ${suspicious}`);
console.log(`(type-only exports skipped automatically)`);
