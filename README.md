# telebirr-receipt

### What is telebirr-receipt

`telebirr-receipt` Is a small nodejs package to parse and verify
telebirr transaction receipt. Any telebirr transaction
receipt can be found through url
`https://transactioninfo.ethiotelecom.et/receipt/{receipt_no}`
by replacing `{receipt_no}` with receipt number or id which is sent from telebirr
transaction SMS or the full receipt url is also sent via SMS.

### How to install

``
npm install telebirr-receipt
``

### Basic usage

#### Loading receipt from url

```javascript
const {receipt, utils: {loadReceipt, parseFromHTML}} = require('telebirr-receipt')

// for debugging only security warning
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

// TODO: replace `receipt_no`
loadReceipt({receipt_no: "ADQ..."}).then(htmlAsString => {
    const {verify, verifyOnly, verifyAll, equals} = receipt(parseFromHTML(htmlAsString), {to: "Someone"})
    verify((parsed_fields, pre_defined_fields) => {
        // do anything with receipt
    })
}).catch(reason => {
    console.error(reason)
}).finally(() => {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 1
})
```

#### Using custom receipt parser with custom string source

```javascript
const {receipt} = require("telebirr-receipt");

function parse() {
    const source = 'payer_name=Abebe;amount=5000;to=Kebede'
    const result = {};

    source.split(';').forEach(pair => {
        const field = pair.split('=');
        result[field[0]] = field[1];
    });

    return result;
}

const {verifyAll, verify, equals} = receipt(parse(), {to: 'Kebede', amount: '5000'})

// match expected receiver's name with the name found on receipt
console.log(verify((parsed_info, my_info) => equals(parsed_info?.to, my_info?.to)))

console.log(verifyAll(['payer_name'])) // match every field but `payer_name`
```