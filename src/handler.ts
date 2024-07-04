import { NextRequest } from "next/server";
import {  ServiceCtr, ServiceRegistery } from "../../njses/service-registery";
import { NextModule } from "./module";

export async function nextHandler(handlerService: ServiceCtr) {
    // // Start injection ahere already, otherwise the initialization would only start on the first request
    // const nextModule = ServiceRegistery.inject(NextModule);
    // const serviceInstance = ServiceRegistery.inject(handlerService);

    // return (request: NextRequest) => {};
}
