import { defineOperationApp } from "@directus/extensions-sdk";

export default defineOperationApp({
  id: "operation-extract-colors",
  name: "Extract Colors",
  icon: "palette",
  description: "Extract color palette from character splash art.",
  overview: ({ character }) => [
    {
      label: "Character",
      text: character,
    },
  ],
  options: [
    {
      field: "character",
      name: "Character",
      type: "string",
      meta: {
        width: "full",
        interface: "input",
        required: true,
      },
    },
  ],
});
