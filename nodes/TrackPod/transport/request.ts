import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	IN8nHttpFullResponse,
	JsonObject,
	NodeApiError,
} from 'n8n-workflow';

const BASE_URL = 'https://api.track-pod.com';

/**
 * Make an authenticated request to the Track-POD API.
 *
 * - `body` accepts a single object or an array (for bulk endpoints).
 * - Returns `null` on 404 / 410 (mirrors Workato's `after_error_response` block).
 *
 * Headers kept to the absolute minimum: n8n adds `Host` automatically —
 * including it manually causes a TLS alert 80 (SSL internal_error) on some
 * servers. `Content-Type` is only set when there is an actual request body.
 */
export async function trackPodRequest(
	context: IExecuteFunctions,
	method: IHttpRequestOptions['method'],
	endpoint: string,
	body?: IDataObject | IDataObject[],
	qs?: IDataObject,
): Promise<IDataObject | null> {
	const hasBody = Array.isArray(body) ? body.length > 0 : body !== undefined && Object.keys(body).length > 0;

	const options: IHttpRequestOptions = {
		method,
		url: `${BASE_URL}${endpoint}`,
		headers: {
			...(hasBody ? { 'Content-Type': 'application/json' } : {}),
		},
		...(qs && Object.keys(qs).length > 0 ? { qs } : {}),
		...(hasBody ? { body: body as IDataObject } : {}),
		returnFullResponse: true,
		ignoreHttpStatusErrors: true,
	};

	let response: IN8nHttpFullResponse;
	try {
		response = (await context.helpers.httpRequestWithAuthentication.call(
			context,
			'trackPodApi',
			options,
		)) as IN8nHttpFullResponse;
	} catch (error) {
		throw new NodeApiError(context.getNode(), error as JsonObject);
	}

	if (response.statusCode === 404 || response.statusCode === 410) {
		return null;
	}

	if (response.statusCode >= 400) {
		throw new NodeApiError(context.getNode(), response.body as JsonObject, {
			httpCode: String(response.statusCode),
		});
	}

	return response.body as IDataObject;
}
