import patternTree from "./pattern-tree.snapshot";
import { GuessedFile, Node, Tree } from "./model/tree";
import { fromHex, toHex } from "./model/toHex";

export const filetypeinfo = (
  bytes: number[] | Uint8Array | Uint8ClampedArray
): GuessedFile[] => {
  let tree: Tree = patternTree;
  for (const k of Object.keys(tree.offset)) {
    const offset = fromHex(k);
    const offsetExceedsFile = offset >= bytes.length;
    if (offsetExceedsFile) {
      continue;
    }
    const node: Node = (patternTree as any).offset[k];

    const guessed = walkTree(offset, bytes, node);
    if (guessed.length > 0) {
      return guessed;
    }
  }
  if (tree.noOffset === null) {
    return [];
  }
  return walkTree(0, bytes, tree.noOffset);
};

const walkTree = (
  index: number,
  bytes: number[] | Uint8Array | Uint8ClampedArray,
  node: Node
): GuessedFile[] => {
  let step: Node = node;
  let guessFile: GuessedFile[] = [];
  while (true) {
    const currentByte = toHex(bytes[index]);
    if (step.bytes["?"] && !step.bytes[currentByte]) {
      step = step.bytes["?"];
    } else {
      step = step.bytes[currentByte];
    }
    if (!step) {
      return guessFile;
    }
    if (step && step.matches) {
      guessFile = step.matches;
    }
    index += 1;
  }
};

export default filetypeinfo;

export const filetypename = (bytes: any[]): string[] =>
  filetypeinfo(bytes).map((e) => e.typename);
export const filetypemime = (bytes: any[]): string[] =>
  filetypeinfo(bytes).map((e) => (e.mime ? e.mime : ""));
export const filetypeextension = (bytes: any[]): string[] =>
  filetypeinfo(bytes).map((e) => (e.extension ? e.extension : ""));
