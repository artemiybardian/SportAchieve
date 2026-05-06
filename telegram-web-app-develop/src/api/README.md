### API Generation

This API client is generated using `openapi-typescript-codegen`.

#### How to generate

To regenerate the API client, run the following command from the project root:

```bash
# Using a local file
npx openapi-typescript-codegen --input ./api.openapi.json --output ./src/api/generated --client fetch

# Using a URL
npx openapi-typescript-codegen --input https://example.com/openapi.json --output ./src/api/generated --client fetch
```

#### Parameters:
- `--input ./api.openapi.json`: The OpenAPI specification file (can be a local path or a URL).
- `--output ./src/api/generated`: The directory where the generated code will be placed.
- `--client fetch`: Specifies the HTTP client to use (matches the current implementation).

> [!IMPORTANT]  
> Do not manually edit files in the `src/api/generated` directory as they will be overwritten on the next generation.
