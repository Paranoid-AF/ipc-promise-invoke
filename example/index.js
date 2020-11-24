const child = require('child_process').fork('./child.js')
const send = require('..').sender(child)

// 'send' will return a Promise, the second parameter could be any.
send('table-tenis', 'ping')
  .then((val) => {
    console.log(val)
  })

send('table-tenis', 'hey!')
  .then((val) => {
    console.warn(val)
  })