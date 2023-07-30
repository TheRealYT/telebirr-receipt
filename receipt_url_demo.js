const {receipt, utils: {loadReceipt, parseFromHTML}} = require('.')

// use it with caution / security warning
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

// TODO: replace `receipt_no`
loadReceipt({receipt_no: "ADQ..."}).then(htmlAsString => {
    const {verify, verifyOnly, verifyAll, equals} = receipt(parseFromHTML(htmlAsString), {to: "Someone"})
    verify((parsed_fields, pre_defined_fields) => {

    })
}).catch(reason => {
    console.error(reason)
}).finally(() => {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 1
})