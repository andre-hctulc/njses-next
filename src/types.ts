import type { NextRequest } from "next/server";

/*
Init Next.js types for request and response
*/
declare module "../../njses-http" {
    interface HTTPRequest extends NextRequest {
        // Thsi is passed to the next route handler as second arg by next.
        // We add it here to make it available in the handler
        params: Record<string, string>;
    }
    interface HTTPResponse extends Response {}
}

declare module "../../njses" {
    interface CustomShadow {
        /** `<actionName, methodName>` */
        nextjsActions: Record<string, string>;
        nextjsActionMatcher: ActionMatcherCheck;
    }

    interface CustomFieldShadow {
        nextjsActionMatcher: ActionMatcherCheck;
    }

    interface CustomShadowParam {
        /** `<actionName, methodName>` */
        nextjsActionSession: boolean;
    }
}

/** Use module augmentation to extend this interface */
export interface NextActionSession {}

export type NextRouteHandler = (
    request: NextRequest,
    params: Record<string, string>
) => Response | Promise<Response>;

export type ActionMatcherCheck =
    | string
    | RegExp
    | ((actionName: string) => boolean)
    | (string | RegExp | ((actionName: string) => boolean))[];
