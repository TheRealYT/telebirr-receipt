const {receipt} = require(".");

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

console.log(verify((parsed_info, my_info) => equals(parsed_info?.to, my_info?.to))) // match any field

console.log(verifyAll(['payer_name'])) // match every field but `payer_name`