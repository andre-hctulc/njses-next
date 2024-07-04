import type { NextRequest } from "next/server";
import { ServiceCtr, ServiceRegistery } from "../../njses/service-registery";
import { Module } from "../../njses/decorators";
import {
    HTTP,
    HTTPNormalizedRequest,
    HTTPNormalizedResponse,
    HTTPRequest,
    HTTPResponse,
    Reveive,
    Send,
} from "../../njses-http";

/*
Init Next.js types for request and response
*/
declare module "../../njses-http" {
    interface HTTPRequest extends NextRequest {}
    interface HTTPResponse extends Response {}
}

@HTTP
@Module({ name: "$$next-module" })
export class NextModule {
    @Reveive
    async receive(request: HTTPRequest): Promise<HTTPNormalizedRequest> {
        return {
            originalRequest: request,
            body: undefined,
            searchParams: request.nextUrl.searchParams,
            headers: request.headers,
            cookies: request.cookies
                .getAll()
                .reduce<Record<string, string>>((acc, { name, value }) => ({ ...acc, [name]: value }), {}),
            method: request.method,
            // Keep empty, so we do not have to define a path for each route, as Next.js does not have a path concept
            path: "",
        };
    }

    @Send
    async send(request: HTTPRequest, response: HTTPNormalizedResponse): Promise<HTTPResponse> {
        return new Response(response.body, { headers: response.headers, status: response.status });
    }
}

export async function nextHandler(handlerService: ServiceCtr) {
    // Start injection ahere already, otherwise the initialization would only start on the first request
    const nextModule = ServiceRegistery.inject(NextModule);
    const serviceInstance = ServiceRegistery.inject(handlerService);

    return (request: NextRequest) => {};
}
