const {spawn} = require("child_process");
const PluginError = require("plugin-error");

const PLUGIN_NAME = "sh-thunk";

const SILENT_GULP = process.argv.some(arg => ["--silent", "-S"].includes(arg));

function promiseSpawn(spawnArgs, {env, ...options}, onChild) {
    return new Promise((resolve, reject) => {
        const child = spawn(...spawnArgs, {
            stdio: "inherit",
            env: {
                ...process.env,
                PATH: "node_modules/.bin:" + process.env.PATH,
                ...env,
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
        ["sh", ["-eu" + (SILENT_GULP ? "" : "x")]],
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
    if (args[0] === undefined || isPlainObj(args[0])) {
        const options = args[0];
        return (...args) => {
            return () => promiseSh(parseCommand(...args), options);
        };
    }

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
    if (Array.isArray(strings) && !values[0]) {
        return strings.join(" ");
    }

    if (typeof strings === "string") {
        return strings;
    }

    return strings.reduce((acc, part, index) => {
        const value = values[index];

        return (
            acc +
            part +
            expandIterable(value)
                .map(mapParts)
                .join(" ")
        );
    }, "");
}

sh.sh = sh;
sh.parseCommand = parseCommand;
module.exports = sh;
