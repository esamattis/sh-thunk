const fs = require("fs").promises;
const { sh, parseCommand } = require("./sh-thunk");

global.GULP_SH_TEST = true;

describe("parseCommand", () => {
    test("empty string", () => {
        expect(parseCommand("")).toBe("");
    });

    test("basic tag usage", () => {
        expect(parseCommand``).toBe("");
    });

    test("arguments in tag", () => {
        expect(parseCommand`ls -l`).toBe("ls -l");
    });

    test("just array", () => {
        expect(parseCommand(["foo", "bar"])).toBe("foo bar");
    });

    test("tag usage with var", () => {
        expect(parseCommand`foo: ${1}`).toBe("foo: 1");
    });

    test("tag usage with array", () => {
        expect(parseCommand`foo: ${["first", "second"]}`).toBe(
            "foo: first second",
        );
    });

    test("tag usage with nested array", () => {
        expect(parseCommand`foo: ${[1, [2, [3]]]}`).toBe("foo: 1 2 3");
    });

    test("tag usage with spaces", () => {
        expect(parseCommand`foo: ${"foo bar"}`).toBe("foo: 'foo bar'");
    });

    test("tag can expand generator", () => {
        function* gen() {
            yield "a";
            yield "b";
        }

        expect(parseCommand`foo: ${gen()}`).toBe("foo: a b");
    });
});

describe("sh.capture", () => {
    test("can capture stdout", async () => {
        const { stdout } = await sh.capture`
            echo hello stdout
            >&2 echo hello stderr
        `();
        expect(stdout.trim()).toEqual("hello stdout");
    });

    test("can get stderr", async () => {
        const { stderr } = await sh.capture`
            echo hello stdout
            >&2 echo hello stderr
        `();
        expect(stderr.trim()).toEqual("hello stderr");
    });

    test("can get combined stdout and stderr", async () => {
        const { both } = await sh.capture`
            echo -n foo
            >&2 echo -n bar
            echo -n baz
        `();
        expect(both.trim()).toEqual("foobazbar");
    });

    test("rejects on errors", async () => {
        await expect(sh.capture`exit 123`()).rejects.toMatchObject({
            message: "Bad exit code: 123",
        });
    });

    test("can you .toString()", async () => {
        const out = await sh.capture`
            echo -n foo
            >&2 echo -n bar
            echo -n baz
        `();
        expect(`${out}`).toEqual("foobazbar");
    });

    test("can read multi chunk files", async () => {
        const file = `${__dirname}/package-lock.json`;
        const real = await fs.readFile(file);

        const { stdout } = await sh.capture`cat ${file}`();

        expect(stdout).toEqual(real.toString());
    });
});
