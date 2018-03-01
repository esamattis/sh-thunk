# gulp-sh

Simple shell script plugin for Gulp for those who just need a simple task runner.

- No fancy piping or complicated configuration
- Honors your SHELL env
- Scripts are executed with `-eu`

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

        # You can embed any shell scripts here
        echo $(basename $HOME)
    `)
);
```

That's it.
