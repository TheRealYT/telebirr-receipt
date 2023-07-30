const {receipt, utils: {loadReceipt, parseFromHTML}} = require('.')

// use it with caution / security warning
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

// TODO: replace `receiptNo`
loadReceipt({receiptNo: '...'}).then(htmlAsString => {
    const {verify, verifyOnly, verifyAll, equals} = receipt(parseFromHTML(htmlAsString), {to: 'Someone'})
    verify((parsedFields, preDefinedFields) => {
        // do anything with receipt
    })
}).catch(reason => {
    console.error(reason)
}).finally(() => {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 1
})