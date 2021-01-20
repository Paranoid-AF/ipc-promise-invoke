const [ addChannel, cancelChannel, disband ] = require('..').resolver()
addChannel('table-tenis', async (val) => {
  // Simulate operations that take some time.
  const serverResponse = await new Promise((resolve, reject) => {
    let delay, text
    if(val === 'ping') {
      delay = 10
      text = 'pong'
    } else {
      delay = 1
      text = `Let's all love Lain!`
    }
    setTimeout(() => {
      resolve(text)
    }, delay)
  })

  return val + ' pong ' + serverResponse
})


// Disband to stop the event loop when ipc is no longer needed.
setTimeout(() => {
  disband()
}, 60000)