---normal run---

yarn chain
yarn deploy
yarn start
Before running yarn run-node make sure to delete the files IPFS and postgres in the subgraph/graph_node/data
yarn run-node
yarn local-create
yarn local-ship

---server run---

yarn server - to run express server if needed
yarn copy-contracts - to get latest deployed contract abi and address available on server

---envio run---

npm i -g envio
cd path/to/envio-directory
pnpm install
envio codegen
envio dev

- Open your browser and navigate to [http://localhost:8080](http://localhost:8080).
- The Hasura admin-secret/password is `testing`.
- a bit more info in envio readme check if needed