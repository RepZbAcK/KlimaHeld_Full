#!/usr/bin/env node

const { runDemo } = require('./demo');
const { NETWORKS } = require('./networkConfig');

function parseArguments(argv) {
    const args = argv.slice(2);
    const result = {
        network: undefined,
        listNetworks: false
    };

    for (let i = 0; i < args.length; i += 1) {
        const arg = args[i];

        if (arg === '--list-networks' || arg === '-l') {
            result.listNetworks = true;
        } else if (arg.startsWith('--network=')) {
            result.network = arg.split('=')[1];
        } else if (arg === '--network' || arg === '-n') {
            const nextValue = args[i + 1];
            if (!nextValue || nextValue.startsWith('-')) {
                throw new Error('Missing value for --network option');
            }
            result.network = nextValue;
            i += 1;
        } else if (!result.network) {
            result.network = arg;
        } else {
            throw new Error(`Unknown argument "${arg}"`);
        }
    }

    return result;
}

function printAvailableNetworks() {
    console.log('Verfügbare Netzwerke:');
    for (const network of Object.keys(NETWORKS)) {
        console.log(`- ${network}`);
    }
}

async function main() {
    try {
        const options = parseArguments(process.argv);

        if (options.listNetworks) {
            printAvailableNetworks();
            return;
        }

        const result = await runDemo(options.network || 'testnet');
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
    main,
    parseArguments
};
