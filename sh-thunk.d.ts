export function sh(shell: string): () => Promise<void>;

export function sh(
    shell: TemplateStringsArray,
    ...args: string[]
): () => Promise<void>;

export default sh;
