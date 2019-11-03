# sh-thunk

Generate promise returning thunks from shell strings.

This makes it really simple to execute shell scripts from task runners
suchs as Gulp and Jake which can take promise returning function as the task implementation.

Here's an example of a `gulpfile.js`:

```js
const { task, parallel } = require("gulp");
const { sh } = require("sh-thunk");

const jsfiles = ["foo.js", "bar.js"];

// Simple commands
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
    `,
);
```

Jakefile is basically the same:

```js
const { sh } = require("sh-thunk");

task("webpack", sh`webpack --mode production`);
```

Also useful in jest hooks:

```js
// generate 5MB file
beforeAll(sh`dd if=/dev/zero of=big.txt count=5k bs=1024 2> /dev/null`);
```

The scripts are executed with `sh -eu` and `./node_modules/.bin` is put to `PATH` automatically.

## Capturing output

There's a `sh.capture` variant if you need to capture command output instead
of piping it through.

```js
const {
    stdout,
    stderr,
    both,
} = await sh.capture`git rev-parse --abbrev-ref HEAD`();
```

Where `stdout` and `stderr` are strings of the corresponding output channels
and `both` is string with both outputs interleaved as it would show up in the
terminal.
