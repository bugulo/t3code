import type { Processor } from "unified";

interface DestinationCompileContext {
  readonly stack: ReadonlyArray<{ readonly type: string; url?: string }>;
  resume(): string;
  sliceSerialize(token: unknown): string;
}

const WINDOWS_PATH_PATTERN = /^(?:[A-Za-z]:|\\)\\/;

function exitDestination(this: DestinationCompileContext, token: unknown) {
  const decoded = this.resume();
  const authored = this.sliceSerialize(token);
  const node = this.stack[this.stack.length - 1];
  if (node) node.url = WINDOWS_PATH_PATTERN.test(authored) ? authored : decoded;
}

/** CommonMark drops backslashes in `C:\me\.t3` and `\\host`; Windows path backslashes are all separators. */
function attachWindowsPathDestinations(this: Processor) {
  const data = this.data();
  const fromMarkdownExtensions = data.fromMarkdownExtensions ?? (data.fromMarkdownExtensions = []);
  fromMarkdownExtensions.push({
    exit: {
      resourceDestinationString: exitDestination,
      definitionDestinationString: exitDestination,
    },
  });
}

export const remarkPreserveWindowsPathDestinations = attachWindowsPathDestinations;
