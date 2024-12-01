module.exports =  {
	id: 'operation-extract-colors',
	name: 'Extract Character Color Palette',
	icon: 'palette',
	description: 'Extract colors from character splash art using extract-colors.',
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
