"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackPod = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const order_1 = require("./descriptions/order");
const request_1 = require("./transport/request");
/**
 * Build an order payload from the `additionalFields` collection.
 * Field names in the collection are Track-POD PascalCase (e.g. "Number",
 * "GoodsList") so they can be spread directly into the API body.
 * GoodsList and CustomFields are JSON strings that need parsing.
 */
function buildOrderBody(context, itemIndex) {
    const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {});
    const body = {};
    for (const [key, value] of Object.entries(additionalFields)) {
        if (value === '' || value === null || value === undefined)
            continue;
        if (key === 'GoodsList' || key === 'CustomFields') {
            if (typeof value === 'string' && value.trim()) {
                try {
                    body[key] = JSON.parse(value);
                }
                catch {
                    // leave as-is; server will reject with a clear error
                    body[key] = value;
                }
            }
            else {
                body[key] = value;
            }
        }
        else {
            body[key] = value;
        }
    }
    return body;
}
class TrackPod {
    constructor() {
        this.description = {
            displayName: 'Track-POD',
            name: 'trackPod',
            icon: 'file:trackpod.svg',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
            description: 'Interact with the Track-POD delivery management API',
            defaults: {
                name: 'Track-POD',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'trackPodApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Order',
                            value: 'order',
                        },
                    ],
                    default: 'order',
                },
                ...order_1.orderOperations,
                ...order_1.orderFields,
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const resource = this.getNodeParameter('resource', 0);
        const operation = this.getNodeParameter('operation', 0);
        // ── Create Orders (bulk) ──────────────────────────────────────────────────
        // All input items are collected into one array and sent in a single POST.
        // The node therefore returns exactly one output item (the API response).
        if (resource === 'order' && operation === 'createOrders') {
            try {
                const updateAddressGps = this.getNodeParameter('updateAddressGps', 0, false);
                const updateGoodsPrice = this.getNodeParameter('updateGoodsPrice', 0, false);
                const orders = items.map((_, i) => {
                    const client = this.getNodeParameter('client', i);
                    const address = this.getNodeParameter('address', i);
                    return {
                        Client: client,
                        Address: address,
                        ...buildOrderBody(this, i),
                    };
                });
                const response = await (0, request_1.trackPodRequest)(this, 'POST', '/order/bulk', orders, { updateAddressGps, updateGoodsPrice });
                returnData.push({ json: response !== null && response !== void 0 ? response : {} });
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message } });
                }
                else {
                    throw error;
                }
            }
            return [returnData];
        }
        // ── Per-item operations ────────────────────────────────────────────────────
        for (let i = 0; i < items.length; i++) {
            try {
                if (resource === 'order') {
                    // ── Get Details ────────────────────────────────────────────────
                    if (operation === 'getDetails') {
                        const getBy = this.getNodeParameter('getBy', i);
                        const keyParamMap = {
                            Number: 'number',
                            Id: 'id',
                            TrackId: 'trackId',
                        };
                        const key = this.getNodeParameter(keyParamMap[getBy], i);
                        const responseData = await (0, request_1.trackPodRequest)(this, 'GET', `/order/${getBy}/${encodeURIComponent(key)}`);
                        returnData.push({ json: responseData !== null && responseData !== void 0 ? responseData : {}, pairedItem: { item: i } });
                        // ── Update Order ───────────────────────────────────────────────
                    }
                    else if (operation === 'updateOrder') {
                        const updateAddressGps = this.getNodeParameter('updateAddressGps', i, false);
                        const orderBody = buildOrderBody(this, i);
                        const response = await (0, request_1.trackPodRequest)(this, 'PUT', '/order', orderBody, { updateAddressGps });
                        returnData.push({ json: response !== null && response !== void 0 ? response : {}, pairedItem: { item: i } });
                        // ── Delete Order ───────────────────────────────────────────────
                    }
                    else if (operation === 'deleteOrder') {
                        const deleteBy = this.getNodeParameter('deleteBy', i);
                        const keyParamMap = {
                            Number: 'deleteNumber',
                            Id: 'deleteId',
                        };
                        const key = this.getNodeParameter(keyParamMap[deleteBy], i);
                        const response = await (0, request_1.trackPodRequest)(this, 'DELETE', `/Order/${deleteBy}/${encodeURIComponent(key)}`);
                        returnData.push({ json: response !== null && response !== void 0 ? response : {}, pairedItem: { item: i } });
                    }
                    else {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
                            itemIndex: i,
                        });
                    }
                }
                else {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Unknown resource: ${resource}`, {
                        itemIndex: i,
                    });
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.TrackPod = TrackPod;
