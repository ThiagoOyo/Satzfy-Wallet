const router = require("express").Router();
const { getBalance, createInvoice, getChannelBalance, payInvoice, decodePayReq } = require("../lnd.js");

router.get("/balance", (req, res) => {
    getBalance()
        .then((balance) => {
            res.status(200).json(balance);
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

router.get("/channelbalance", (req, res) => {
    getChannelBalance()
        .then((channelBalance) => {
            res.status(200).json(channelBalance);
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

router.post("/invoice", (req, res) => {
    const {value, memo} = req.body;

    createInvoice({ value, memo})
        .then((invoice) => {
            res.status(200).json(invoice);
        })
        .catch((err) => {
            res.status(500).json(err);
        });
})

router.post(("/payinvoice"), (req, res) => {
    const { payment_request } = req.body;

    payInvoice({ payment_request })
        .then((paidInvoice) => {
            if (paidInvoice.payment_error) {
                res.status(500).json(paidInvoice);
            }
            
            // save tx to database
            res.status(200).json(paidInvoice);
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});

router.post("/decodepayreq", (req, res) => {
    const { payment_request } = req.body;

    decodePayReq({ payment_request })
        .then((decodedInvoice) => {
            res.status(200).json(decodedInvoice);
        })
        .catch((err) => {
            res.status(500).json(err);
        });
});


module.exports = router;