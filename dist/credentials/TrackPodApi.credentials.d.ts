import { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties, Icon } from 'n8n-workflow';
export declare class TrackPodApi implements ICredentialType {
    name: string;
    displayName: string;
    icon: Icon;
    documentationUrl: string;
    properties: INodeProperties[];
    authenticate: IAuthenticateGeneric;
    test: ICredentialTestRequest;
}
