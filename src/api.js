import { defineOperationApi } from '@directus/extensions-sdk';
import { camelCase } from 'lodash';

export default defineOperationApi({
	id: 'operation-lodash-camelcase',
	handler: ({ text }) => {
		return {
			text: camelCase(text),
		};
	},
});