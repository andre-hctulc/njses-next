import type { NextRequest } from "next/server";

/*
Init Next.js types for request and response
*/
declare module "../../njses-http" {
    interface HTTPRequest extends NextRequest {}
    interface HTTPResponse extends Response {}
}

declare module "../../njses" {
    interface ServiceShadow {
        /** `<actionName, methodName>` */
        nextjsActions: Record<string, string>;
    }
}

export {};
