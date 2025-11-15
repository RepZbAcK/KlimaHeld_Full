const crypto = require('crypto');

const Block = require('./block');
const Transaction = require('./transaction');
const { NETWORKS } = require('./networkConfig');

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

module.exports = Blockchain;
