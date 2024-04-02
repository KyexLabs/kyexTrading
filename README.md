# ZetaChain App Contracts

Official Contracts of KYEX Trading Platform.

## Learn more about KYEX Trading here

* Check our [website](https://www.kyex.io/).
* Read our [docs](https://docs.kyex.io/).

<!-- ## Packages -->

## Usage

1. Install [Node.js LTS](https://nodejs.org/en/) (previous versions may, but are not guaranteed to work).

1. Install `yarn` (make sure NPM has the right permissions to add global packages):

        npm i -g yarn

1. Install the dependencies:

        yarn

1. From the root folder, compile the contracts:

        yarn compile

### Packages

#### [ZEVM App contracts](packages/zevm-app-contracts)

### Cross-repo commands

#### Package-specific commands

They run independently, only on the packages that implement them:

```bash
yarn compile
```

```bash
yarn clean
```

```bash
yarn test
```

#### Repo commands

They run once, across the whole repo:

```bash
yarn lint
```

```bash
yarn lint:fix
```