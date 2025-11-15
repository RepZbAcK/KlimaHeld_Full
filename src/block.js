const crypto = require('crypto');

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

module.exports = Block;
