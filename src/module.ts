
import { HTTP, Reveive, HTTPRequest, HTTPNormalizedRequest, Send, HTTPNormalizedResponse, HTTPResponse } from "../../njses-http";
import { Module } from "../../njses";

@HTTP()
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