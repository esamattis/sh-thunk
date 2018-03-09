# gulp-sh

Simple shell script plugin for Gulp for those who just need a simple task runner. No fancy streaming things here.

Example:

```js
const {task, parallel} = require("gulp");
const {sh} = require("gulp-sh");

const jsfiles = ["foo.js", "bar.js"];

// Simple commands
task("webpack", sh("webpack --mode production"));
task("webpack-dev", sh(["webpack", "--mode", "development"]));
task("webpack-dev-server", sh`webpack-dev-server --mode development`);

// Expand arrays in tagged templates
task("eslint", sh`eslint --max-warnings 0 ${jsfiles}`);
task("prettier", sh`prettier --write ${jsfiles}`);

// Pass options to child_process.spawn
task("prettier", sh({stdio: null})`prettier --write ${jsfiles}`);

// Run commands in parallel with gulp 4
test("test-all", parallel("eslint", "test"));

// Multiline scripts
task(
    "fix-babel",
    sh`
        find node_modules/ -name .babelrc -delete
        find node_modules/ -name .babelrc.js -delete

        # You can embed any shell scripts here
        echo $(basename $HOME)
    `
);
```

The scripts are executed with `sh -eu`.

That's it.
