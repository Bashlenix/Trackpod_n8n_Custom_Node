import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class TrackPodApi implements ICredentialType {
	name = 'trackPodApi';
	displayName = 'Track-POD API';
    icon: Icon = 'file:trackpod.svg';
	documentationUrl = 'https://app.swaggerhub.com/apis-docs/Track-POD/api/';

	properties: INodeProperties[] = [
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

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-KEY': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.track-pod.com',
			url: '/Test',
			skipSslCertificateValidation: true,
		},
	};
}
