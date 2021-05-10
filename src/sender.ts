import type { ChildProcess } from 'child_process'
import { v4 as uuidv4 } from 'uuid'
import { signature, defaultSenderOption } from './constant'
import { ResBody, ResponseType } from './resolver'
import { ErrorThrower } from './error'

const errorPrefix = `[ipc-promise-invoke] Error on sender - `

const callResolve: Record<string,
{
  resolve: (...args: any) => any,
  reject: (...args: any) => any
}> = { }

export const sender = (sendTo: NodeJS.Process | ChildProcess, options: Options = {}) => {
  const finalOptions = Object.assign(defaultSenderOption, options)

  const listener = (msg: ResBody) => {
    if(msg.ipcSignature === signature && msg.uuid && msg.uuid in callResolve && msg.type === 'RESPONSE') {
      if(msg.status === ResponseType.SUCCESS) {
        callResolve[msg.uuid].resolve(msg.payload)
      } else {
        callResolve[msg.uuid].reject(ErrorThrower(msg.payload))
      }
      delete callResolve[msg.uuid]
    }
  }

  sendTo.on('message', listener)

  const send = (channel: string, ...payload: any) => {
    const reqId = uuidv4()
    return new Promise((resolve, reject) => {
      callResolve[reqId] = { resolve, reject }
      if(sendTo.send) {
        sendTo.send({
          channel,
          payload,
          ipcSignature: signature,
          uuid: reqId,
          type: 'REQUEST'
        } as ReqBody)
      }

      if(finalOptions.timeout > 0) {
        setTimeout(() => {
          if(reqId in callResolve) {
            delete callResolve[reqId]
            reject(new Error(`${errorPrefix}Time out for request on channel '${channel}': ${payload}`))
          }
        }, finalOptions.timeout)
      }

    })
  }

  const disband = () => {
    sendTo.removeListener('message', listener)
  }

  return [ send, disband ] as [ typeof send, typeof disband]
}

export interface ReqBody {
  channel: string,
  payload: any,
  ipcSignature?: string,
  uuid?: string,
  type: 'REQUEST'
}

export interface Options {
  timeout?: number
}