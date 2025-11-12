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

module.exports = Transaction;
