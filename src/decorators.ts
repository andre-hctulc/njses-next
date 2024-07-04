import { Flush } from "../../njses/decorators";
import { Shadow } from "../../njses/shadow";

/**
 * Flushes the args and registers the action
 * @method_decorator
 */
export function Action(actionName: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        Shadow.update(target, (shadow) => {
            if (!shadow.nextjsActions) shadow.nextjsActions = {};
            shadow.nextjsActions[propertyKey] = actionName;
        });
        // Always flush, as here are commonly are (should) parameter validators applied
        Flush()(target, propertyKey, descriptor);
    };
}
