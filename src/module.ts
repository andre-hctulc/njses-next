import {
    HTTP,
    Receive,
    HTTPRequest,
    HTTPNormalizedRequest,
    Send,
    HTTPNormalizedResponse,
    HTTPResponse,
} from "../../njses-http";
import {
    MethodName,
    MethodParams,
    MethodReturnType,
    Module,
    ServiceInstance,
    Registery,
    Shadow,
} from "../../njses";
import { NEXT_FIELD, NEXT_ROLE } from "./const";
import type { ActionMatcherCheck, NextActionSession } from "./types";
import type { ActionSessionProvider } from "./decorators";

@HTTP()
@Module({ name: "$$next-module" })
export class NextModule {
    @Receive
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

    async action<S extends ServiceInstance, M extends MethodName<S> = MethodName<S>>(
        actionService: S,
        actionName: M,
        params: MethodParams<S, M>
    ): Promise<Awaited<MethodReturnType<S, M>>> {
        const shadow = Shadow.get(actionService);
        const actionField = shadow?.nextjsActions?.[actionName];

        if (!actionField) throw new Error(`Action ${actionName} not found`);

        let session: NextActionSession | null = null;

        for (const service of Registery.getAssignees(NEXT_ROLE.SERVICE)) {
            const methods = Shadow.getMethods(service, NEXT_FIELD.SESSION_PROVIDER);

            for (const method of methods) {
                const field = Shadow.getField(service, method);

                if (!this.matches(actionName, field?.nextjsActionMatcher)) continue;

                session = await Registery.invoke<ActionSessionProvider>(service, method, [
                    actionService,
                    params,
                    session,
                ]);
            }
        }

        const result = await Registery.invoke(
            actionService as ServiceInstance,
            actionField,
            Shadow.mapArgs(actionService, actionField, params, (arg, param) => {
                if (param?.nextjsActionSession) return session;
                return arg;
            })
        );

        return result;
    }

    getAssignees(actionName: string) {
        return Registery.getAssignees(NEXT_ROLE.SERVICE).filter((service) => {
            const shadow = Shadow.get(service);
            console.log("######### Shadow", shadow);
            // apply matcher
            return this.matches(actionName, shadow?.nextjsActionMatcher);
        });
    }

    matches(actionName: string, matcher: ActionMatcherCheck | null | undefined): boolean {
        if (matcher == null) return true;
        else if (typeof matcher === "string") return matcher === actionName;
        else if (matcher instanceof RegExp) return matcher.test(actionName);
        else if (typeof matcher === "function") return matcher(actionName);
        else return matcher.some((m) => this.matches(actionName, m));
    }
}
