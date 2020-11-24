import type { ChildProcess } from 'child_process'
import { v4 as uuidv4 } from 'uuid'
import { signature, defaultSenderOption } from './constant'
import { ResBody, ResponseType } from './resolver'

const callResolve: Record<string,
{
  resolve: (...args: any) => any,
  reject: (...args: any) => any
}> = { }

export const sender = (sendTo: NodeJS.Process | ChildProcess, options: Options = {}) => {
  const finalOptions = Object.assign(defaultSenderOption, options)

  sendTo.on('message', (msg: ResBody) => {
    if(msg.ipcSignature === signature && msg.uuid && msg.uuid in callResolve) {
      if(msg.status === ResponseType.SUCCESS) {
        callResolve[msg.uuid].resolve(msg.payload)
      } else {
        callResolve[msg.uuid].reject(msg.payload)
      }
      delete callResolve[msg.uuid]
    }
  })

  return (channel: string, payload: any) => {
    const reqId = uuidv4()
    return new Promise((resolve, reject) => {
      callResolve[reqId] = { resolve, reject }
      if(sendTo.send) {
        sendTo.send({
          channel,
          payload,
          ipcSignature: signature,
          uuid: reqId
        } as ReqBody)
      }

      if(finalOptions.timeout > 0) {
        setTimeout(() => {
          if(reqId in callResolve) {
            reject(new Error(`Time out for request on channel '${channel}': ${payload}`))
          }
        }, finalOptions.timeout)
      }

    })
  }
}

export interface ReqBody {
  channel: string,
  payload: any,
  ipcSignature?: string,
  uuid?: string
}

export interface Options {
  timeout?: number
}