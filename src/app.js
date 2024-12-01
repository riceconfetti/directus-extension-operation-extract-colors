module.exports =  {
	id: 'operation-extract-colors',
	name: 'Extract Character Color Palette',
	icon: 'palette',
	description: 'Extract colors from character splash art using extract-colors.',
	overview: ({ collection }) => [
		{
			label: '$t:collection',
			text: collection,
		},
	],
	options: [
		{
			field: 'character',
			name: 'Character',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'input',
			},
		},
	],
};
