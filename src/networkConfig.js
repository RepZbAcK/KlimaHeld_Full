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

module.exports = {
    NETWORKS
};
