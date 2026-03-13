"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackPodApi = void 0;
class TrackPodApi {
    constructor() {
        this.name = 'trackPodApi';
        this.displayName = 'Track-POD API';
        this.icon = 'file:trackpod.svg';
        this.documentationUrl = 'https://app.swaggerhub.com/apis-docs/Track-POD/api/';
        this.properties = [
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                required: true,
                hint: 'Get your API key <a href="https://web.track-pod.com/en/settings/integrations/web-api" target="_blank">here</a>.',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    'X-API-KEY': '={{$credentials.apiKey}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: 'https://api.track-pod.com',
                url: '/Test',
                skipSslCertificateValidation: true,
            },
        };
    }
}
exports.TrackPodApi = TrackPodApi;
