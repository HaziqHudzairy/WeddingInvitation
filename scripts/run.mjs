#!/usr/bin/env node
/**
 * Run a script inside one client project.
 *
 *   npm run dev -- rose-garden
 *   npm run build -- rose-garden
 *
 * When only one project exists the name can be left out.
 */
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectsDir = join(root, 'projects');
const [script, name, ...rest] = process.argv.slice(2);

const projects = readdirSync(projectsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(projectsDir, d.name, 'package.json')))
  .map((d) => d.name)
  .sort();

let project = name;
if (!project) {
  if (projects.length === 1) {
    project = projects[0];
  } else {
    console.log(`Usage: npm run ${script} -- <project>\n\nProjects:\n${projects.map((p) => `  - ${p}`).join('\n')}`);
    process.exit(1);
  }
}

if (!projects.includes(project)) {
  console.error(`Unknown project "${project}". Available: ${projects.join(', ') || '(none)'}`);
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(join(projectsDir, project, 'package.json'), 'utf8'));
if (!pkg.scripts?.[script]) {
  console.error(`Project "${project}" has no "${script}" script.`);
  process.exit(1);
}

const args = ['run', script, '-w', `projects/${project}`, ...(rest.length ? ['--', ...rest] : [])];
console.log(`\n> ${project}: npm ${args.join(' ')}\n`);
const child = spawn('npm', args, { cwd: root, stdio: 'inherit', shell: true });
child.on('exit', (code) => process.exit(code ?? 0));
