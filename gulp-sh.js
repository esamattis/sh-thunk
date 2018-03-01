const {spawn} = require("child_process");
const PluginError = require("plugin-error");

const PLUGIN_NAME = "gulp-sh";
const SHELL = process.env.SHELL || "sh";

function promiseSpawn(spawnCommand, options, onChild) {
    return new Promise((resolve, reject) => {
        const child = spawn(...spawnCommand, {
            stdio: "inherit",
            env: {
                PATH: "node_modules/.bin:" + process.env.PATH,
            },
            ...options,
        });
        if (typeof onChild === "function") {
            onChild(child);
        }
        child.on("error", reject);
        child.on("close", code => {
            if (code === 0) {
                resolve();
            } else {
                reject(new PluginError(PLUGIN_NAME, "Bad exit code: " + code));
            }
        });
    });
}

function promiseSh(command, options) {
    if (Array.isArray(command)) {
        command = command.join(" ");
    }

    let spawnCommand = [SHELL, ["-eux", "-c", command]];
    return promiseSpawn(spawnCommand, options);
}

function promiseScript(script, options) {
    return promiseSpawn(
        [SHELL, ["-eux"]],
        {...options, stdio: ["pipe", 1, 2]},
        child => {
            child.stdin.write(script);
            child.stdin.end();
        }
    );
}

function script(...args) {
    return () => promiseScript(...args);
}

function sh(...args) {
    return () => promiseSh(...args);
}

sh.sh = sh;
sh.script = script;
module.exports = sh;
