# KlimaHeld Blockchain

Die KlimaHeld Blockchain ist eine Kryptowährung, die dazu dient, den Kampf gegen den Klimawandel zu unterstützen, indem sie umweltfreundliches Verhalten fördert und die Pflanzung von Bäumen ermöglicht.

## Verwendung

Um die Blockchain zu verwenden, können Sie das `Blockchain`-Objekt instanziieren und Transaktionen hinzufügen. Die Transaktionen werden automatisch validiert und in Blöcken gespeichert.

Beispiel:

```javascript
const { Blockchain, Transaction } = require('./blockchain');

const myCoin = new Blockchain();

const address1 = myCoin.getAddress();
const address2 = myCoin.getAddress();

myCoin.createTransaction(new Transaction(address1, address2, 100));
myCoin.createTransaction(new Transaction(address2, address1, 50));

myCoin.minePendingTransactions('miner-address');

console.log(JSON.stringify(myCoin.chain, null, 4));
