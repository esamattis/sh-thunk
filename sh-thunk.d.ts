interface ShThunk {
    (shell: string): Promise<void>;
    (shell: TemplateStringsArray, ...args: string[]): Promise<void>;
    capture(
        shell: TemplateStringsArray,
        ...args: string[]
    ): Promise<{
        stdout: string;
        stderr: string;
        both: string;
        toString(): string;
    }>;
}

export const sh: ShThunk;

export default sh;
