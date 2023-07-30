# telebirr-receipt

### What is telebirr-receipt

`telebirr-receipt` Is a small nodejs package to parse and verify
telebirr transaction receipt. Any telebirr transaction
receipt can be found through the url
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

### Use case
The main use case of this project is to overcome payment api unavailability and requirements in Ethiopia. Based on this project you can get payed and verify your payment transactions.

1. Your customers may fill their personal or payment information
2. Your customers pay you via telebirr
3. You let your customers know how to verify their payment by entering their transaction number or link which is received from 127 / telebirr SMS.
4. So you can verify that who send the money to you.

### DISCLAIMER

The open-source code provided is offered "as is" without warranty of any kind, either express or implied, including, but not limited to, the implied warranties of merchantability and fitness for a particular purpose. The author of this code shall not be liable for any damages arising from the use of this code, including, but not limited to, direct, indirect, incidental, special, or consequential damages. 

Users of this open-source code are solely responsible for testing and verifying the code's suitability for their specific purposes. The author of this code makes no representations or warranties about the code's accuracy, reliability, completeness, or timeliness. The user assumes all risk associated with the use of this code and agrees to indemnify and hold harmless the author of this code from any and all claims, damages, or liabilities arising from the use of this code. 

By using this open-source code, the user acknowledges and agrees to these terms and conditions.
