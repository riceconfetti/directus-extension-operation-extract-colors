export default {
	id: 'operation-lodash-camelcase',
	name: 'Lodash Camel Case',
	icon: 'electric_bolt',
	description: 'Use Lodash Camel Case Function.',
	overview: ({ text }) => [
		{
			label: 'Text',
			text: text,
		},
	],
	options: [
		{
			field: 'text',
			name: 'Text',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'input',
			},
		},
	],
};