
# gulp-sh

Simple shell script plugin for Gulp. Maybe too simple. Not very "gulpy" even.

Example:

```js
const {task, series} = require("gulp");
const sh = require("gulp-sh");

// Simple commands
task("webpack", sh("webpack --mode production"));
task("tsc", sh("tsc"));
task("jest", sh("jest"));
task("tslint", sh("tslint --type-check --project tsconfig.json"));
test("test-all", series("tsc", "test", "tshint"));

// Run multiline scripts
task(
    "create-foo",
    sh.script(`
        if [ ! -f foo.txt ]; then
            touch foo.txt
        fi
    `),
);
```

That's it.