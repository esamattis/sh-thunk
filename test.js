const {sh, parseCommand} = require("./gulp-sh");
const {spawn} = require("child_process");

global.GULP_SH_TEST = true;

describe("parseCommand", () => {
    test("empty string", () => {
        expect(parseCommand("")).toBe("");
    });

    test("basic tag usage", () => {
        expect(parseCommand``).toBe("");
    });

    test("just array", () => {
        expect(parseCommand(["foo", "bar"])).toBe("foo bar");
    });

    test("tag usage with var", () => {
        expect(parseCommand`foo: ${1}`).toBe("foo: 1");
    });

    test("tag usage with array", () => {
        expect(parseCommand`foo: ${["first", "second"]}`).toBe(
            "foo: first second"
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
