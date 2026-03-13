import { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
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
export declare function trackPodRequest(context: IExecuteFunctions, method: IHttpRequestOptions['method'], endpoint: string, body?: IDataObject | IDataObject[], qs?: IDataObject): Promise<IDataObject | null>;
