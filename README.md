# sh-thunk

Generate promise returning thunks from shell strings.

This makes it really simple to execute shell scripts from task runners
suchs as Gulp and Jake which can take promise returning function as the task implementation.

Here's an example of a `gulpfile.js`:

```js
const {task, parallel} = require("gulp");
const {sh} = require("sh-thunk");

const jsfiles = ["foo.js", "bar.js"];

// Simple commands
task("webpack", sh("webpack --mode production"));
task("webpack", sh(["webpack", "--mode", "development"]));
task("webpack-dev-server", sh`webpack-dev-server --mode development`);

// Expand arrays in tagged templates
task("eslint", sh`eslint --max-warnings 0 ${jsfiles}`);
task("prettier", sh`prettier --write ${jsfiles}`);

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

Jakefile is basically the same:

```js
const {sh} = require("sh-thunk");

task("webpack", sh("webpack --mode production"));
```

The scripts are executed with `sh -eu` and `./node_modules/.bin` is put to `PATH` automatically.

That's it.
