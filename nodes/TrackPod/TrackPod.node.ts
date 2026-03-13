import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { orderFields, orderOperations } from './descriptions/order';
import { trackPodRequest } from './transport/request';

/**
 * Build an order payload from the `additionalFields` collection.
 * Field names in the collection are Track-POD PascalCase (e.g. "Number",
 * "GoodsList") so they can be spread directly into the API body.
 * GoodsList and CustomFields are JSON strings that need parsing.
 */
function buildOrderBody(context: IExecuteFunctions, itemIndex: number): IDataObject {
	const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;
	const body: IDataObject = {};

	for (const [key, value] of Object.entries(additionalFields)) {
		if (value === '' || value === null || value === undefined) continue;

		if (key === 'GoodsList' || key === 'CustomFields') {
			if (typeof value === 'string' && value.trim()) {
				try {
					body[key] = JSON.parse(value);
				} catch {
					// leave as-is; server will reject with a clear error
					body[key] = value;
				}
			} else {
				body[key] = value;
			}
		} else {
			body[key] = value;
		}
	}

	return body;
}

export class TrackPod implements INodeType {
	description: INodeTypeDescription = {
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
			...orderOperations,
			...orderFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// ── Create Orders (bulk) ──────────────────────────────────────────────────
		// All input items are collected into one array and sent in a single POST.
		// The node therefore returns exactly one output item (the API response).
		if (resource === 'order' && operation === 'createOrders') {
			try {
				const updateAddressGps = this.getNodeParameter('updateAddressGps', 0, false) as boolean;
				const updateGoodsPrice = this.getNodeParameter('updateGoodsPrice', 0, false) as boolean;

				const orders: IDataObject[] = items.map((_, i) => {
					const client = this.getNodeParameter('client', i) as string;
					const address = this.getNodeParameter('address', i) as string;
					return {
						Client: client,
						Address: address,
						...buildOrderBody(this, i),
					};
				});

				const response = await trackPodRequest(
					this,
					'POST',
					'/order/bulk',
					orders,
					{ updateAddressGps, updateGoodsPrice },
				);

				returnData.push({ json: response ?? {} });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message } });
				} else {
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
						const getBy = this.getNodeParameter('getBy', i) as 'Number' | 'Id' | 'TrackId';
						const keyParamMap: Record<string, string> = {
							Number: 'number',
							Id: 'id',
							TrackId: 'trackId',
						};
						const key = this.getNodeParameter(keyParamMap[getBy], i) as string;

						const responseData = await trackPodRequest(
							this,
							'GET',
							`/order/${getBy}/${encodeURIComponent(key)}`,
						);

						returnData.push({ json: responseData ?? {}, pairedItem: { item: i } });

					// ── Update Order ───────────────────────────────────────────────
					} else if (operation === 'updateOrder') {
						const updateAddressGps = this.getNodeParameter('updateAddressGps', i, false) as boolean;
						const orderBody = buildOrderBody(this, i);

						const response = await trackPodRequest(
							this,
							'PUT',
							'/order',
							orderBody,
							{ updateAddressGps },
						);

						returnData.push({ json: response ?? {}, pairedItem: { item: i } });

					// ── Delete Order ───────────────────────────────────────────────
					} else if (operation === 'deleteOrder') {
						const deleteBy = this.getNodeParameter('deleteBy', i) as 'Number' | 'Id';
						const keyParamMap: Record<string, string> = {
							Number: 'deleteNumber',
							Id: 'deleteId',
						};
						const key = this.getNodeParameter(keyParamMap[deleteBy], i) as string;

						const response = await trackPodRequest(
							this,
							'DELETE',
							`/Order/${deleteBy}/${encodeURIComponent(key)}`,
						);

						returnData.push({ json: response ?? {}, pairedItem: { item: i } });

					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
							itemIndex: i,
						});
					}
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`, {
						itemIndex: i,
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
