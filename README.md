# NodeWallet

This is the NodeWallet browser extension wallet. To learn how to interact with NodeWallet via web applications, check out the [NodeWallet SDK](https://github.com/decentralized-authority/nodewallet/blob/master/packages/sdk/README.md).

## Getting Started

### 1. Install dependencies:
```sh
npm install
```

### 2. Create necessary `.env` files
Location: `/apps/extension/.env`
Contents: *(replace with your own values)*
```
POKT_MAINNET_ENDPOINT=https://your-pokt-mainnet-endpoint.com
POKT_TESTNET_ENDPOINT=https://your-pokt-testnet-endpoint.com
```
Location: `/apps/extension-ui/.env.development.local`
Contents:
```
REACT_APP_TOS_URL=https://files.decentralizedauthority.com/tos.md
```
Location: `/apps/extension-ui/.env.production.local`
Contents:
```
REACT_APP_TOS_URL=https://files.decentralizedauthority.com/tos.md
```

### 3. Build the project
```sh
npm run build
```

### 4. Bundle the extension
```sh
npm run bundle
```

### 5. Load the extension
1. Open Chrome
2. Go to `chrome://extensions`
3. Enable `Developer mode`
4. Drag and drop the `/apps/extension/dist` folder into the browser window
5. If subsequent changes are made and the build and bundle scripts are run again, you can click the refresh button on the extension card in `chrome://extensions` rather than repeat step 4.

## Project Structure

This project is a monorepo that uses [Turborepo](https://turbo.build/repo) and contains the following projects:

* `apps/extension` This is the main extension project. It is built and bundled as the (NodeWallet Chrome extension)[https://chromewebstore.google.com/detail/nodewallet/ilibmadejjooogcniiomgdgbojkmlbim].
* `apps/extension-ui` This is the UI for the extension. It is a React app that is built using [create-react-app](https://create-react-app.dev/).
* `apps/sdk-demo` This is a React app that demonstrates how to use the NodeWallet SDK. It is built using [create-react-app](https://create-react-app.dev/).
* `packages/sdk` This is the [NodeWallet SDK](https://github.com/decentralized-authority/nodewallet/blob/master/packages/sdk/README.md). It is a TypeScript library that can be used by browser applications to easily interact with the NodeWallet extension.
* `packages/types` This package is a TypeScript library that contains shared types used by the NodeWallet SDK and the NodeWallet extension.
* `packages/background` This package contains the background scripts.
* `packages/content` This package contains the content scripts.
* `packages/content-bridge` This package contains the content bridge scripts that are exposed to the browser page.
* `packages/util` This package contains utility scripts that are used by the extension.
* `packages/util-browser` This package contains utility scripts that are used only by the front end of the extension.
*  `wallet-utils` This package contains crypto and coin-specific functionality used by the extension's background scripts.

## Development mode
In ordery to run the project in development mode, you need to:
1. Install dependencies
2. Build the project
3. Set the environment variable `BROWSER=none`
4. Run the project with `npm start`

*One important note is that you cannot edit the UI in real time and see it in the browser. Because of manifest v3 security protections, the extension cannot load a URL from the local file system. You can still work in the project and fix and debug, but you will need to build, bundle, and then refresh the extension in the browser to see your changes.*

## Contributions
Contributions are welcome! If you have any issues and/or contributions you would like to make, feel free to file an issue and/or issue a pull request.

## License
[Apache License Version 2.0](https://github.com/decentralized-authority/nodewallet/blob/master/LICENSE)

Copyright (c) 2024 by [Decentralized Authority](https://decentralizedauthority.com/).
