const {task} = require("gulp");
const {sh} = require("./sh-thunk");

task("test", sh`jest`);
