import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { extname } from "node:path";

const sourceRoot = new URL("../src/", import.meta.url);

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!context.parentURL?.startsWith(sourceRoot.href)) {
      return nextResolve(specifier, context);
    }

    // Next's bundler accepts this subpath without its published .js suffix.
    if (specifier === "next/headers") {
      return nextResolve("next/headers.js", context);
    }

    let url;
    if (specifier.startsWith("@/")) {
      url = new URL(specifier.slice(2), sourceRoot);
    } else if (specifier.startsWith("./") || specifier.startsWith("../")) {
      url = new URL(specifier, context.parentURL);
    } else {
      return nextResolve(specifier, context);
    }

    if (!extname(url.pathname)) {
      const tsFile = new URL(url.href + ".ts");
      if (existsSync(tsFile)) return nextResolve(tsFile.href, context);
    }

    return nextResolve(url.href, context);
  },

  load(url, context, nextLoad) {
    if (url.startsWith(sourceRoot.href) && url.endsWith(".ts")) {
      return nextLoad(url, { ...context, format: "module-typescript" });
    }
    return nextLoad(url, context);
  },
});
