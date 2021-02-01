const child = require('child_process').fork('./child.js')
const [ send, disband ] = require('..').sender(child)

// 'send' will return a Promise, parameters following the channel could be any or empty.
send('table-tenis', 'ping', 'stein')
  .then((val) => {
    console.log(val)
    disband() // Force disband anyway.
    child.kill('SIGTERM')
    // process.exit()
  })
.catch((err) => {
  console.log(err)
  console.log('oh no!')
  disband()
})