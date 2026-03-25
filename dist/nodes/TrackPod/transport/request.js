"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackPodRequest = trackPodRequest;
const n8n_workflow_1 = require("n8n-workflow");
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
async function trackPodRequest(context, method, endpoint, body, qs) {
    const hasBody = Array.isArray(body) ? body.length > 0 : body !== undefined && Object.keys(body).length > 0;
    const options = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers: {
            ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(qs && Object.keys(qs).length > 0 ? { qs } : {}),
        ...(hasBody ? { body: body } : {}),
        returnFullResponse: true,
        ignoreHttpStatusErrors: true,
    };
    let response;
    try {
        response = (await context.helpers.httpRequestWithAuthentication.call(context, 'trackPodApi', options));
    }
    catch (error) {
        throw new n8n_workflow_1.NodeApiError(context.getNode(), error);
    }
    if (response.statusCode === 404 || response.statusCode === 410) {
        return null;
    }
    if (response.statusCode >= 400) {
        throw new n8n_workflow_1.NodeApiError(context.getNode(), response.body, {
            httpCode: String(response.statusCode),
        });
    }
    return response.body;
}
