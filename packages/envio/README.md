---

# Envio

For comprehensive guidance on all Envio indexer features, please refer to the [documentation website](https://docs.Envio.dev).

## Installation and Setup

Envio uses **pnpm** for package management, while your project relies on **yarn**. To avoid conflicts and dependency issues, we recommend setting up Envio independently within its own directory.

### Prerequisites

Ensure the following tools are installed:

- **Node.js**: We recommend using a version manager like [fnm](https://github.com/Schniz/fnm) or [nvm](https://github.com/nvm-sh/nvm) for installation.
- **pnpm**: The package manager used by Envio.
- **Docker Desktop**: Required for running Envio locally.
- **Envio**: Install globally via npm:
  ```bash
  npm i -g envio
  ```

### Installation

1. Navigate to the Envio directory:
   ```bash
   cd path/to/envio-directory
   ```

2. Install the necessary packages:
   ```bash
   pnpm install
   ```

### Local Development

To run or generate code within Envio, use the following commands:

- **Generate Code**:
  ```bash
  envio codegen
  ```

- **Run Locally**:
  ```bash
  envio dev
  ```

### Viewing Indexed Results

You can view the indexed results on a local Hasura server:

- Open your browser and navigate to [http://localhost:8080](http://localhost:8080).
- The Hasura admin-secret/password is `testing`.
- The tables can be viewed in the **Data** tab or queried from the **Playground**.

### Notes

- Envio is designed to work with real blockchain networks and SE-2 subgraphs. Running it on localhost or with Hardhat is not currently supported.
- Envio’s setup is optimized for speed and is up-to-date as of 24-Aug-24 as a subgraph of **Alvo**.
- Envio was tested successfully and it's cool. It has been tested only locally and was successful. Deployment hasn't been tested yet, but hopefully, it will work fine—let's see, haha.

---