const assert = require('assert/strict');
const { describe, it } = require('node:test');

const { Blockchain, NETWORKS, runDemo } = require('../src');

describe('Blockchain', () => {
    it('rejects invalid transactions', () => {
        const blockchain = new Blockchain(NETWORKS.testnet);
        assert.throws(() => blockchain.createTransaction('', '0xabc', 10), /Invalid transaction/);
    });

    it('mines pending transactions and rewards miners', async () => {
        const testConfig = {
            ...NETWORKS.testnet,
            treePlanting: {
                ...NETWORKS.testnet.treePlanting,
                enabled: false
            }
        };

        const blockchain = new Blockchain(testConfig);
        const sender = blockchain.generateAddress();
        const receiver = blockchain.generateAddress();
        const miner = blockchain.generateAddress();

        blockchain.createTransaction(sender, receiver, 5);

        await blockchain.minePendingTransactions(miner);
        await blockchain.minePendingTransactions(miner);

        assert.equal(blockchain.getBalanceOfAddress(miner), testConfig.miningReward);
        assert.equal(blockchain.getBalanceOfAddress(receiver), 5);
        assert.equal(blockchain.chain.length, 3);
        assert.ok(blockchain.isChainValid());
    });
});

describe('runDemo', () => {
    it('returns summary information for the requested network', async () => {
        const result = await runDemo('testnet');
        assert.equal(result.network, 'testnet');
        assert.equal(result.difficulty, NETWORKS.testnet.difficulty);
        assert.equal(result.chainHeight, 2);
        assert.ok(result.chainIsValid);
    });

    it('throws an error for unknown networks', async () => {
        await assert.rejects(() => runDemo('unknown'), /Unknown network/);
    });
});
