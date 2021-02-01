const [ addChannel, cancelChannel, disband ] = require('..').resolver()
addChannel('table-tenis', async (val1, val2) => {
  // Simulate operations that take some time.
  const serverResponse = await new Promise((resolve, reject) => {
    console.log(val1, val2)
    setTimeout(() => {
      resolve('handled!')
    }, 3000)
  })  
  return 'pong ' + serverResponse
})


// Disband to stop the event loop when ipc is no longer needed.
setTimeout(() => {
  disband()
}, 60000)