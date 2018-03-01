# gulp-sh

Simple shell script plugin for Gulp for those who just need a simple task runner.

- No fancy piping - just shell commands
- No need to prefix commands with `./node_modules/.bin/`. It's in the PATH automatically.
- Honors your SHELL env
- Scripts are executed with `-eu` so they crash early on errors

```
npm install gulp-sh
```

Example:

```js
const {task, series} = require("gulp");
const sh = require("gulp-sh");

// Simple commands
task("webpack", sh("webpack --mode production"));
task("webpack-dev-server", sh("webpack-dev-server --mode development"));
task("jest", sh("jest"));
task("eslint", sh("eslint --max-warnings 0"));
test("test-all", series("eslint", "jest"));

// Multiline scripts
task(
    "fix-babel",
    sh.script(`
        find node_modules -name .babelrc -delete
        find node_modules -name .babelrc.js -delete

        # You can embed any shell code in here
        echo $(basename $HOME)
    `)
);
```

That's it.
