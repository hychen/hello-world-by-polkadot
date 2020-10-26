const { ApiPromise, WsProvider } = require('@polkadot/api');
const yargs = require('yargs/yargs');

const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv))
    .usage('display block information on polkadot.')
    .example('$0', 'display latest block.')
    .example('$0 --number=2186018', 'display a block by number.')
    .example('$0 --hash=0xa94e2e8761faf2d74db6eae59a651fec58ea967027cd65ae3118f24c976ee56d', 'display a block by hash.')
    .option('number', {type: 'number', 'describe': 'block number.'})
    .option('hash', {type: 'string', 'describe': 'block hash.'})
    .argv;

function displayBlock(block) {
    console.log(`header hash: ${block.header.hash.toHex()}`);

    console.log('extrinsics: ');
    block.extrinsics.forEach((ex, index) => {
    // the extrinsics are decoded by the API, human-like view
    console.log('------------------------');
    console.log(`index=${index}`);
    console.log(ex.toHuman());

    const { isSigned, meta, method: { args, method, section } } = ex;

    // explicit display of name, args & documentation
    console.log(`${section}.${method}(${args.map((a) => a.toString()).join(', ')})`);

    // signer/nonce info
    if (isSigned) {
      console.log(`signer=${ex.signer.toString()}, nonce=${ex.nonce.toString()}`);
    }
  });
}

async function main() {
    let result;
    const wsProvider = new WsProvider('wss://rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider });
    if(argv.hash || argv.number) {
        const hash = argv.number ? await api.rpc.chain.getBlockHash(argv.number) : argv.hash;
        result = await api.rpc.chain.getBlock(hash);
    }
    else {
        result = await api.rpc.chain.getBlock();
    }
    return new Promise(cb => {
        cb(result.block);
        api.disconnect();
    });
}

main()
    .then(displayBlock)
    .catch(console.error)