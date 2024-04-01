const LndGrpc = require('lnd-grpc');
const dotenv = require('dotenv');
const telegramBot = require('node-telegram-bot-api');

dotenv.config();

const bot = new telegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: false});

const options = {
    host: process.env.HOST,
    cert: process.env.CERT,
    macaroon: process.env.MACAROON
};

const grpc = new LndGrpc(options);

const connect = async () => {
    await grpc.connect();

    invoiceEventStream();
};

const getBalance = async () => {
    const balance = await grpc.services.Lightning.walletBalance();
    return balance;
};

const getChannelBalance = async () => {
    const channelBalance = await grpc.services.Lightning.channelBalance();
    return channelBalance;
};

const createInvoice = async ({value, memo}) => {
    const invoice = await grpc.services.Lightning.addInvoice({
        value: value,
        memo: memo,
    });

    return invoice;
};

const payInvoice = async ({payment_request}) => {
    const paidInvoice = await grpc.services.Lightning.sendPaymentSync({
        payment_request: payment_request,
    });

    return paidInvoice;
}

const decodePayReq = async ({payment_request}) => {
    const decodedInvoice = await grpc.services.Lightning.decodePayReq({
        pay_req: payment_request,
    });

    return decodedInvoice;
}

// This function creates a watcher on the invoice stream if you call on connect();
const invoiceEventStream = async () => {
    const invoiceStream = await grpc.services.Lightning.subscribeInvoices({
        add_index: 0,
        settle_index: 0,
    }).on('data', async (invoice) => {
        console.log('invoice: ', invoice);
        if (invoice.settled) {
           await handleSettledInvoice(invoice);
        }
    }).on('end', () => {
        console.log('Invoice stream ended');
    }).on('error', (err) => {
        console.log('Invoice stream error: ', err);
    });
}

const handleSettledInvoice = async (invoice) => {
    console.log('invoice: ', invoice);
    if (invoice.settled) {
        console.log('Invoice settled');
        try {
            const channelBalance = await getChannelBalance();
            const message = `
                Invoice Paid:
                Amount: ${invoice.amt_paid} Satoshis
                Memo: ${invoice.memo}
                Payment Hash: ${invoice.r_hash.toString('hex')}

                Channel:
                Local Balance: ${channelBalance.local_balance.sat} Satoshis
                Remote Balance: ${channelBalance.remote_balance.sat} Satoshis
            `;

            bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message);
        } catch (error) {
            console.error('Error getting channel balance:', error);
        }
    }
};

module.exports = {
    connect, 
    grpc,
    getBalance,
    getChannelBalance,
    createInvoice,
    payInvoice,
    decodePayReq
}
