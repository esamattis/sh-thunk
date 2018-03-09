const {spawn} = require("child_process");
const PluginError = require("plugin-error");

const PLUGIN_NAME = "gulp-sh";

function promiseSpawn(spawnArgs, options, onChild) {
    return new Promise((resolve, reject) => {
        const child = spawn(...spawnArgs, {
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

function promiseSh(script, options) {
    return promiseSpawn(
        ["sh", ["-eux"]],
        {
            stdio: ["pipe", 1, 2],
            ...options,
        },
        child => {
            child.stdin.write(script);
            child.stdin.end();
        }
    );
}

function sh(...args) {
    return () => promiseSh(parseCommand(...args));
}

function isIterable(obj) {
    // checks for null and undefined
    if (obj == null) {
        return false;
    }
    return typeof obj[Symbol.iterator] === "function";
}

function isPlainObj(o) {
    return Boolean(o && typeof o == "object" && o.constructor == Object);
}

function expandIterable(iterable) {
    if (!iterable) {
        return [];
    }
    if (typeof iterable === "string") {
        return [iterable];
    }

    if (isIterable(iterable)) {
        let res = [];
        for (let v of iterable) {
            res = res.concat(expandIterable(v));
        }
        return res;
    }

    return [String(iterable)];
}

function mapParts(part) {
    if (part.trim().includes(" ")) {
        return `'${part}'`;
    }

    return part;
}

function parseCommand(strings, ...values) {
    if (isPlainObj(strings)) {
        return (...args) => {
            return {
                options: strings,
                command: parseCommand(...args).command,
            };
        };
    }

    if (Array.isArray(strings) && !values[0]) {
        return {command: strings.map(mapParts).join(" ")};
    }

    if (typeof strings === "string") {
        return {command: strings};
    }

    return {
        command: strings.reduce((acc, part, index) => {
            const value = values[index];

            return (
                acc +
                part +
                expandIterable(value)
                    .map(mapParts)
                    .join(" ")
            );
        }, ""),
    };
}

sh.sh = sh;
sh.parseCommand = parseCommand;
module.exports = sh;
