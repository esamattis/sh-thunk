const {task} = require("gulp");
const {sh} = require("./gulp-sh");

task("test", sh`jest`);
