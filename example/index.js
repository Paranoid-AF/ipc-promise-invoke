const child = require('child_process').fork('./child.js')
const [ send, disband ] = require('..').sender(child)

// 'send' will return a Promise, the second parameter could be any.
send('table-tenis', 'ping')
  .then((val) => {
    console.log(val)
    disband() // Force disband anyway.
    child.kill('SIGTERM')
    // process.exit()
  })

send('table-tenis', 'hey!')
  .then((val) => {
    console.warn(val)
  })