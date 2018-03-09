const {sh, parseCommand} = require("./gulp-sh");
const {spawn} = require("child_process");

global.GULP_SH_TEST = true;

describe("parseCommand", () => {
    test("empty string", () => {
        expect(parseCommand("")).toEqual({command: ""});
    });

    test("basic tag usage", () => {
        expect(parseCommand``).toEqual({command: ""});
    });

    test("just array", () => {
        expect(parseCommand(["foo", "bar"])).toEqual({command: "foo bar"});
    });

    test("tag usage with var", () => {
        expect(parseCommand`foo: ${1}`).toEqual({command: "foo: 1"});
    });

    test("tag usage with array", () => {
        expect(parseCommand`foo: ${["first", "second"]}`).toEqual({
            command: "foo: first second",
        });
    });

    test("tag usage with nested array", () => {
        expect(parseCommand`foo: ${[1, [2, [3]]]}`).toEqual({
            command: "foo: 1 2 3",
        });
    });

    test("tag usage with spaces", () => {
        expect(parseCommand`foo: ${"foo bar"}`).toEqual({
            command: "foo: 'foo bar'",
        });
    });

    test("tag can expand generator", () => {
        function* gen() {
            yield "a";
            yield "b";
        }

        expect(parseCommand`foo: ${gen()}`).toEqual({command: "foo: a b"});
    });

    test("handle options", () => {
        expect(parseCommand({option: 1})`foo`).toEqual({
            options: {option: 1},
            command: "foo",
        });
    });
});
