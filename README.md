# setup-minio

GitHub Action to install the MinIO Client (mc) and optionally configure an alias.

## Usage

Add this action to your workflow:

```yaml
uses: JanSolo1/setup-minio@v1
with:
  mc-version: latest       # optional, default: "latest"
  alias: myminio           # optional
  endpoint: https://...    # optional
  access_key: AKIA...
  secret_key: ...
  insecure: 'true'         # optional, default: 'true'