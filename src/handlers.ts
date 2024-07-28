import { ServiceCtr, ServiceInstance, Shadow, inject } from "../../njses";
import { NextModule } from "./module";
import { NextRouteHandler } from "./types";
import { HTTPModule, HTTPRequest } from "../../njses-http";

export function routeHandler(routeService: ServiceInstance): NextRouteHandler {
    // trigger mounts immeadiately (Note this function cannot be async)
    inject(HTTPModule);
    if (!Shadow.isDynamic(routeService)) inject(routeService);

    return async (request, params) => {
        const http = await inject(HTTPModule);
        const routeServiceInstance = await inject(routeService);
        // add params to request
        Object.defineProperty(request, "params", { value: params });
        return await http.incoming(routeServiceInstance, request as HTTPRequest);
    };
}

export function actionHandler<P extends [...any] = [...any], R = any>(
    actionName: string,
    actionService: ServiceCtr<any>
): (...params: P) => Promise<Awaited<R>> {
    // trigger mounts immeadiately (Note this function cannot be async)
    inject(NextModule);
    inject(actionService);

    return async (...params: P) => {
        const actionServiceInstance = await inject(actionService);
        const next = await inject(NextModule);
        return next.action(actionServiceInstance as any, actionName, params);
    };
}
