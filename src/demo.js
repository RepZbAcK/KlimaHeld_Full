const Blockchain = require('./blockchain');
const { NETWORKS } = require('./networkConfig');

async function runDemo(networkName = 'testnet') {
    const normalizedName = typeof networkName === 'string' ? networkName.toLowerCase() : '';
    const config = NETWORKS[normalizedName];

    if (!config) {
        const availableNetworks = Object.keys(NETWORKS).join(', ');
        throw new Error(`Unknown network "${networkName}". Available networks: ${availableNetworks}`);
    }

    const blockchain = new Blockchain(config);

    const address1 = blockchain.generateAddress();
    const address2 = blockchain.generateAddress();
    const minerAddress = blockchain.generateAddress();

    blockchain.createTransaction(address1, address2, 42);
    blockchain.createTransaction(address2, address1, 13);

    await blockchain.minePendingTransactions(minerAddress);

    const balances = {
        [address1]: blockchain.getBalanceOfAddress(address1),
        [address2]: blockchain.getBalanceOfAddress(address2),
        [minerAddress]: blockchain.getBalanceOfAddress(minerAddress)
    };

    return {
        network: config.name,
        difficulty: config.difficulty,
        pendingTransactions: blockchain.pendingTransactions,
        chainHeight: blockchain.chain.length,
        balances,
        chainIsValid: blockchain.isChainValid()
    };
}

module.exports = {
    runDemo
};
