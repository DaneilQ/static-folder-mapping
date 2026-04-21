# Static Folder Mapping

A utility that scans a static assets directory and generates a fully-typed TypeScript (or JavaScript) module — so you can reference every file static file on your public/static folder or your entire project if you're a psycho I guess.

This utility is ideal for static-site frameworks such as Astro and Gatsby, since it generates asset mappings once and introduces no runtime overhead.

---

## How it works

1. You point `init()` at a folder (e.g. `./public`).
2. The tool walks the directory tree recursively.
3. Every file path is stored as a value in a nested object whose keys are slugified versions of the folder/file names.
4. The resulting object is written to a `.ts` or `.js` + `.d.ts` file of your choice.

### Example

Given this folder structure:

```
public/
  images/
    logo.png
    hero.png
  css/
    style.css
```

Running `init('./public')` produces:

```ts
const staticFolder = {
  "images": {
    "logo_png": "images/logo.png",
    "hero_png": "images/hero.png"
  },
  "css": {
    "style_css": "css/style.css"
  }
} as const;

export type StaticFolder = typeof staticFolder;
export { staticFolder };
```

---

## Usage

Edit `src/index.ts` (or any entry point) and call `init`:

```ts
import { init } from "./src/index.ts";

await init('./public', {
  variableName: 'publicPaths',
  typeName: 'PublicPaths',
  extension: 'ts',
  slugStyle: 'snake',
  pathMode: 'absolute',
  outputPath: './generated/publicPaths',
});
```

---

## Configuration

All options are optional. Defaults are shown below.

| Option | Type | Default         | Description |
|---|---|-----------------|---|
| `extension` | `"ts"` \| `"js"` | `"js"`          | Output file format. `"js"` also generates a `.d.ts` declaration file. |
| `outputPath` | `string` | `"./output"`    | Path for the generated file (without extension). |
| `variableName` | `string` | `"staticFolder"` | Name of the exported `const`. |
| `typeName` | `string` | `"StaticFolder"` | Name of the exported TypeScript type (TS output only). |
| `pathMode` | `"relative"` \| `"absolute"` | `"absolute"`    | Whether stored paths are relative to the scanned folder or absolute. |
| `slugStyle` | `"snake"` \| `"default"` \| `"lower"` \| `"preserve"` | `"snake"`       | How folder/file names are converted into object keys. |
| `slugify` | `(text: string) => string` | —               | Custom slugify function. Overrides `slugStyle` when provided. |

### `slugStyle` values

| Value | Example input | Example output |
|---|---|---|
| `"snake"` | `My Folder` | `my_folder` |
| `"default"` | `My Folder` | `my-folder` |
| `"lower"` | `My Folder` | `my_folder` (no hyphen collapsing) |
| `"preserve"` | `My Folder` | `My Folder` |

