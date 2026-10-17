import path from "node:path";

const root = path.resolve("node_modules");
const projectPkg = await Bun.file("package.json").json();

// Frontend-only deps the modules don't need
const exclude = new Set([
  "monaco-editor",
  "sweetalert2",
  "bootstrap",
  "fabric",
  "html2canvas",
  "vite",
  "twitch-player",
  "socket.io-client",
]);

const roots = [
  ...Object.keys(projectPkg.dependencies ?? {}).filter((d) => !exclude.has(d)),
  "@types/node",
  "@types/bun",
];

const out: Record<string, string> = {};
const seen = new Set<string>();

async function collect(pkg: string) {
  if (seen.has(pkg)) return 0;
  seen.add(pkg);

  const dir = path.join(root, pkg);
  const pjsonFile = Bun.file(path.join(dir, "package.json"));
  if (!(await pjsonFile.exists())) return;
  const pjson = await pjsonFile.json();

  out[`file:///node_modules/${pkg}/package.json`] = JSON.stringify(pjson);

  for await (const f of new Bun.Glob("**/*.d.{ts,mts,cts}").scan({
    cwd: dir,
  })) {
    const rel = f.replaceAll("\\", "/");
    if (rel.includes("node_modules/")) continue;
    const contents = await Bun.file(path.join(dir, f)).text();
    out[`file:///node_modules/${pkg}/${rel}`] = contents;
  }

  for (const dep of Object.keys(pjson.dependencies ?? {})) await collect(dep);
  if (!pkg.startsWith("@types/"))
    await collect("@types/" + pkg.replace(/^@/, "").replace("/", "__"));
}

for (const pkg of roots) {
  const lengthBefore = JSON.stringify(out).length;
  await collect(pkg);
  const lengthAfter = JSON.stringify(out).length;
  const length = lengthAfter - lengthBefore;
  console.log(`${pkg}: ${(length / 1e6).toFixed(1)} MB `);
}

const json = JSON.stringify(out);
await Bun.write("public/types.json", json);
console.log(
  `${Object.keys(out).length} files, ${(json.length / 1e6).toFixed(1)} MB`,
);
