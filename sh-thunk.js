const { spawn } = require("child_process");
const PluginError = require("plugin-error");

const PLUGIN_NAME = "sh-thunk";

function promiseSpawn(spawnArgs, { env, ...options }, onChild) {
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

function promiseSh(script, options, onChild) {
    return promiseSpawn(
        ["sh", ["-eu"]],
        {
            stdio: ["pipe", 1, 2],
            ...options,
        },
        child => {
            if (typeof onChild === "function") {
                onChild(child);
            }
            child.stdin.write(script);
            child.stdin.end();
        },
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

function pickChunks(chunks, props) {
    return Buffer.concat(
        chunks.reduce((acc, current) => {
            for (const prop of props) {
                if (current[prop]) {
                    acc.push(current[prop]);
                }
            }

            return acc;
        }, []),
    ).toString();
}

sh.capture = function captupre(...args) {
    return () => {
        const chunks = [];

        const wrap = {
            get stdout() {
                return pickChunks(chunks, ["stdout"]);
            },
            get stderr() {
                return pickChunks(chunks, ["stderr"]);
            },
            get both() {
                return pickChunks(chunks, ["stdout", "stderr"]);
            },
            toString() {
                return pickChunks(chunks, ["stdout", "stderr"]);
            },
        };

        return promiseSh(
            parseCommand(...args),
            {
                stdio: "pipe",
            },
            function onChild(child) {
                child.stdout.on("data", chunk => {
                    chunks.push({ stdout: chunk });
                });
                child.stderr.on("data", chunk => {
                    chunks.push({ stderr: chunk });
                });
            },
        ).then(() => wrap);
    };
};

sh.sh = sh;
sh.parseCommand = parseCommand;
module.exports = sh;
