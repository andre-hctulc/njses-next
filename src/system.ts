import type { ActionMatcherCheck } from "./types";

export function matches(action: string, matcher: ActionMatcherCheck): boolean {
    if (typeof matcher === "string") return action === matcher;
    else if (typeof matcher === "function") return matcher(action);
    else if (matcher instanceof RegExp) return matcher.test(action);
    else return matcher.every((m) => matches(action, m));
}
