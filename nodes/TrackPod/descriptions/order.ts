import { INodeProperties } from 'n8n-workflow';

export const orderOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['order'] },
		},
		options: [
			{
				name: 'Create Orders',
				value: 'createOrders',
				description: 'Create one or more unscheduled orders (bulk)',
				action: 'Create orders',
			},
			{
				name: 'Delete Order',
				value: 'deleteOrder',
				description: 'Delete an order by Number or ID',
				action: 'Delete order',
			},
			{
				name: 'Get Details',
				value: 'getDetails',
				description: 'Retrieve order details by Number, ID or Tracking-ID',
				action: 'Get order details',
			},
			{
				name: 'Update Order',
				value: 'updateOrder',
				description: 'Update an existing order',
				action: 'Update order',
			},
		],
		default: 'getDetails',
	},
];

const NOT_FOUND_HINT =
	'<b>Please note:</b> if multiple orders share this value, only the most recent will be returned.';

// ─── Shared additional-fields options (both createOrders and updateOrder) ──────
// Field `name` values use Track-POD PascalCase so the collected object can be
// spread directly into the API payload without a mapping table.
const SHARED_ADDITIONAL_OPTIONS: INodeProperties['options'] = [
	{
		displayName: 'Address',
		name: 'Address',
		type: 'string',
		default: '',
		description: 'Delivery/pickup address. Cannot be updated for orders planned into routes.',
	},
	{
		displayName: 'Address GPS Latitude',
		name: 'AddressLat',
		type: 'number',
		default: 0,
		description: 'e.g. 25.29048',
	},
	{
		displayName: 'Address GPS Longitude',
		name: 'AddressLon',
		type: 'number',
		default: 0,
		description: 'e.g. 65.29405',
	},
	{
		displayName: 'Address Zone',
		name: 'AddressZone',
		type: 'string',
		default: '',
	},
	{
		displayName: 'Barcode',
		name: 'Barcode',
		type: 'string',
		default: '',
	},
	{
		displayName: 'Cash on Delivery (COD)',
		name: 'COD',
		type: 'number',
		default: 0,
	},
	{
		displayName: 'Client / Customer Name',
		name: 'Client',
		type: 'string',
		default: '',
	},
	{
		displayName: 'Contact Name',
		name: 'ContactName',
		type: 'string',
		default: '',
	},
	{
		displayName: 'Custom Fields',
		name: 'CustomFields',
		type: 'string',
		default: '',
		description: 'JSON array of custom fields, e.g. [{"Id":"cf1","Value":"val"}]',
		hint: 'Provide as a JSON array',
	},
	{
		displayName: 'Date',
		name: 'Date',
		type: 'string',
		default: '',
		description: 'Order date in YYYY-MM-DD format',
	},
	{
		displayName: 'Depot',
		name: 'Depot',
		type: 'string',
		default: '',
	},
	{
		displayName: 'Email',
		name: 'Email',
		type: 'string',
		default: '',
		description: "Customer's e-mail address",
	},
	{
		displayName: 'Goods List',
		name: 'GoodsList',
		type: 'string',
		default: '',
		description:
			'JSON array of line items, e.g. [{"GoodsName":"Item A","Quantity":2,"GoodsUnit":"pcs"}]',
		hint: 'Provide as a JSON array',
	},
	{
		displayName: 'Note',
		name: 'Note',
		type: 'string',
		default: '',
	},
	{
		displayName: 'Number',
		name: 'Number',
		type: 'string',
		default: '',
		description: 'Order number in your system',
	},
	{
		displayName: 'Order ID',
		name: 'Id',
		type: 'string',
		default: '',
		description: 'Track-POD internal order ID',
	},
	{
		displayName: 'Order Type',
		name: 'Type',
		type: 'options',
		options: [
			{ name: 'Delivery Order', value: 0 },
			{ name: 'Collection Order', value: 1 },
		],
		default: 0,
	},
	{
		displayName: 'Pallets Count',
		name: 'Pallets',
		type: 'number',
		default: 0,
	},
	{
		displayName: 'Phone',
		name: 'Phone',
		type: 'string',
		default: '',
		description: "Customer's contact phone number",
	},
	{
		displayName: 'Priority',
		name: 'Priority',
		type: 'options',
		options: [
			{ name: 'Low', value: 'low' },
			{ name: 'Normal', value: 'normal' },
			{ name: 'High', value: 'high' },
		],
		default: 'normal',
	},
	{
		displayName: 'Service Time (min)',
		name: 'ServiceTime',
		type: 'number',
		default: 0,
		description: 'Service time in minutes. If seconds are specified, value will be decimal.',
	},
	{
		displayName: 'Shipper',
		name: 'Shipper',
		type: 'string',
		default: '',
	},
	{
		displayName: 'Shipper ID',
		name: 'ShipperId',
		type: 'string',
		default: '',
	},
	{
		displayName: 'Time Slot From',
		name: 'TimeSlotFrom',
		type: 'string',
		default: '',
		description: 'Desired delivery/pickup time from (CET), e.g. 09:00',
	},
	{
		displayName: 'Time Slot To',
		name: 'TimeSlotTo',
		type: 'string',
		default: '',
		description: 'Desired delivery/pickup time to (CET), e.g. 17:00',
	},
	{
		displayName: 'Total Volume',
		name: 'Volume',
		type: 'number',
		default: 0,
	},
	{
		displayName: 'Total Weight',
		name: 'Weight',
		type: 'number',
		default: 0,
	},
];

export const orderFields: INodeProperties[] = [
	// ── Get Details ─────────────────────────────────────────────────────────────
	{
		displayName: 'Get By',
		name: 'getBy',
		type: 'options',
		required: true,
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['order'], operation: ['getDetails'] },
		},
		options: [
			{ name: 'Number', value: 'Number' },
			{ name: 'ID', value: 'Id' },
			{ name: 'Tracking-ID', value: 'TrackId' },
		],
		default: 'Number',
		description: 'Field to use when looking up the order',
	},
	{
		displayName: 'Order Number',
		name: 'number',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['order'], operation: ['getDetails'], getBy: ['Number'] },
		},
		hint: NOT_FOUND_HINT,
	},
	{
		displayName: 'Order ID',
		name: 'id',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['order'], operation: ['getDetails'], getBy: ['Id'] },
		},
		hint: NOT_FOUND_HINT,
	},
	{
		displayName: 'Tracking ID',
		name: 'trackId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['order'], operation: ['getDetails'], getBy: ['TrackId'] },
		},
		hint: NOT_FOUND_HINT,
	},

	// ── Create Orders ────────────────────────────────────────────────────────────
	{
		displayName: 'Client / Customer Name',
		name: 'client',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['order'], operation: ['createOrders'] },
		},
		description: 'Client or customer name (required by Track-POD)',
	},
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['order'], operation: ['createOrders'] },
		},
		description:
			'Delivery or pickup address (required by Track-POD). Cannot be updated once planned into a route.',
	},
	{
		displayName: 'Force Update Address GPS',
		name: 'updateAddressGps',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: { resource: ['order'], operation: ['createOrders'] },
		},
		description:
			'Whether to force-update existing Lat/Lon in the Addresses directory from the payload data',
	},
	{
		displayName: 'Force Update Goods Price',
		name: 'updateGoodsPrice',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: { resource: ['order'], operation: ['createOrders'] },
		},
		description:
			'Whether to force-update existing Price in the Goods directory from the payload data',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['order'], operation: ['createOrders'] },
		},
		options: SHARED_ADDITIONAL_OPTIONS.filter((o) => !['Address', 'Client'].includes((o as { name: string }).name)),
	},

	// ── Update Order ─────────────────────────────────────────────────────────────
	{
		displayName: 'Force Update Address GPS',
		name: 'updateAddressGps',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: { resource: ['order'], operation: ['updateOrder'] },
		},
		description:
			'Whether to force-update existing Lat/Lon in the Addresses directory from the payload data',
	},
	{
		displayName: 'Order Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['order'], operation: ['updateOrder'] },
		},
		description:
			'Provide at least <b>ID</b> or <b>Number</b> to identify which order to update. Only the most recent matching order will be updated.',
		options: SHARED_ADDITIONAL_OPTIONS,
	},

	// ── Delete Order ─────────────────────────────────────────────────────────────
	{
		displayName: 'Delete By',
		name: 'deleteBy',
		type: 'options',
		required: true,
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['order'], operation: ['deleteOrder'] },
		},
		options: [
			{ name: 'Number', value: 'Number' },
			{ name: 'ID', value: 'Id' },
		],
		default: 'Number',
	},
	{
		displayName: 'Order Number',
		name: 'deleteNumber',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['order'], operation: ['deleteOrder'], deleteBy: ['Number'] },
		},
		hint: NOT_FOUND_HINT,
	},
	{
		displayName: 'Order ID',
		name: 'deleteId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['order'], operation: ['deleteOrder'], deleteBy: ['Id'] },
		},
		hint: NOT_FOUND_HINT,
	},
];
