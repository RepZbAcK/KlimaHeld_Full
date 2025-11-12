#!/usr/bin/env node
const crypto = require('crypto');

const NETWORKS = Object.freeze({
    mainnet: {
        name: 'mainnet',
        difficulty: 4,
        miningReward: 100,
        treePlanting: {
            enabled: true,
            apiUrl: 'https://tree-nation.com/api/plant',
            defaultMessage: 'KlimaHeld Mainnet Transaction'
        }
    },
    testnet: {
        name: 'testnet',
        difficulty: 2,
        miningReward: 25,
        treePlanting: {
            enabled: false,
            apiUrl: null,
            defaultMessage: 'KlimaHeld Testnet Transaction'
        }
    }
});

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    isValid() {
        if (typeof this.toAddress !== 'string' || this.toAddress.length === 0) {
            return false;
        }

        if (this.fromAddress !== null && (typeof this.fromAddress !== 'string' || this.fromAddress.length === 0)) {
            return false;
        }

        return Number.isFinite(this.amount) && this.amount > 0;
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = new Date(timestamp);
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return crypto
            .createHash('sha256')
            .update(
                [
                    this.previousHash,
                    this.timestamp.toISOString(),
                    JSON.stringify(this.transactions),
                    this.nonce
                ].join(':')
            )
            .digest('hex');
    }

    mineBlock(difficulty) {
        const target = '0'.repeat(Math.max(difficulty, 0));
        while (!this.hash.startsWith(target)) {
            this.nonce += 1;
            this.hash = this.calculateHash();
        }
    }
}

class Blockchain {
    constructor(config = NETWORKS.mainnet) {
        this.config = config;
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.addresses = new Set();
    }

    createGenesisBlock() {
        return new Block(new Date().toISOString(), [], '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addTransaction(transaction) {
        if (!(transaction instanceof Transaction)) {
            throw new Error('Transaction must be an instance of Transaction');
        }

        if (!transaction.isValid()) {
            throw new Error('Invalid transaction');
        }

        this.pendingTransactions.push(transaction);
    }

    createTransaction(fromAddress, toAddress, amount) {
        const transaction = new Transaction(fromAddress, toAddress, amount);
        this.addTransaction(transaction);
        return transaction;
    }

    generateAddress() {
        let address = '0x';
        address += crypto.randomBytes(20).toString('hex');
        this.addresses.add(address);
        return address;
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    async plantTree(quantity, message) {
        if (!this.config.treePlanting.enabled) {
            return { skipped: true };
        }

        const requestBody = {
            quantity,
            message
        };

        try {
            if (typeof fetch !== 'function') {
                throw new Error('fetch API is not available in this environment');
            }

            const response = await fetch(this.config.treePlanting.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Tree planting API responded with status ${response.status}: ${errorBody}`);
            }

            const data = await response.json().catch(() => null);

            return { skipped: false, response: data };
        } catch (error) {
            console.warn('Tree planting request failed:', error.message);
            return { skipped: false, error: error.message };
        }
    }

    async minePendingTransactions(miningRewardAddress) {
        if (typeof miningRewardAddress !== 'string' || miningRewardAddress.length === 0) {
            throw new Error('A valid mining reward address is required');
        }

        const block = new Block(new Date().toISOString(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.config.difficulty);
        this.chain.push(block);

        await this.plantTree(1, this.config.treePlanting.defaultMessage);

        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.config.miningReward)
        ];
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i += 1) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

async function runDemo(networkName = 'testnet') {
    const normalizedName = networkName.toLowerCase();
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

async function main() {
    const [, , networkName] = process.argv;
    try {
        const result = await runDemo(networkName || 'testnet');
        console.log('--- KlimaHeld Demo Result ---');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    NETWORKS,
    Transaction,
    Block,
    Blockchain,
    runDemo
};
