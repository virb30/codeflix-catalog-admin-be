# Codeflix Catalog Admin - Backend

## How to use

- clone this repo
- navigate to root folder
- start container
- run tests

```console
git clone https://github.com/virb30/codeflix-catalog-admin-be .
cd codeflix-catalog-admin-be
docker compose up -d
docker compose exec -it app npm run test
```

To collect coverage use the `test:cov` command:

```console
git clone https://github.com/virb30/codeflix-catalog-admin-be .
cd codeflix-catalog-admin-be
docker compose up -d
docker compose exec -it app npm run test:cov
```

## Devcontainer integration

To use vscode devcontainer to improve development, rename `devcontainer.json.example` to `devcontainer.json` and configure with your needs.
