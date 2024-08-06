import { ServiceCtr, Flush, Role, Instance, Shadow } from "../../njses";
import { NEXT_FIELD, NEXT_ROLE } from "./const";
import type { ActionMatcherCheck, NextActionSession } from "./types";

/**
 * Registers the action and _flushes the arguments_.
 * Headers and Cookies should be read via next's `headers()` and `cookies()` methods.
 * Action sessions can be accessed via the `ActionsSession` parameter decorator.
 * @method_decorator
 */
export function Action(actionName: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const shadow = Shadow.require(target);
        const ctx = shadow.getCtx("$nextjsActions");
        shadow.setCtx("$nextjsActions", { ...ctx, [actionName]: propertyKey });
        // Always flush, as here are commonly are (should) parameter validators applied
        Flush()(target, propertyKey, descriptor);
    };
}

/**
 * This should throw an error on unsuccessful authentication
 */
export type ActionSessionProvider = (
    actionHandler: Instance,
    params: any[],
    currentSession: NextActionSession | null
) => NextActionSession | Promise<NextActionSession>;

/**
 * Creates a session for actions. The decorated method should throw an error if the session is not valid.
 *
 * The service must have the next role assigned, otherwise the authentications will not be executed!
 * @method_decorator
 */
export function ActionSessionProvider<A extends ActionSessionProvider>(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
) {
    Shadow.require(target).addMethod(NEXT_FIELD.SESSION_PROVIDER, propertyKey);
}

/**
 * @param_decorator
 */
export function ActionSession(target: any, propertyKey: string, paramIndex: number) {
    Shadow.require(target).addParam(propertyKey, paramIndex, { $nextjsActionSession: true });
}

/**
 * Assigns the Next role to the given service
 * @class_decorator
 */
export function Next(target: ServiceCtr) {
    return Role(NEXT_ROLE.SERVICE)(target);
}

/**
 * Restricts the method or the action service service to the given matcher
 * @method_decorator
 * @class_decorator
 */
export function ActionMatcher(matcher: ActionMatcherCheck) {
    return function (service: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
        const shadow = Shadow.require(service);

        if (descriptor) {
            shadow.addField(propertyKey as string, { $nextjsActionMatcher: matcher });
        } else {
            shadow.setCtx("$nextjsActionMatcher", matcher);
        }
    };
}
