import { ChildProcess } from 'child_process'
import { signature } from './constant'
import { ReqBody } from './sender'


export const resolver = (resolveFrom: NodeJS.Process | ChildProcess = process) => {
  const channels: Record<string, (...args: any) => any> = {}

  const addChannel = (channel: string, action: (...args: any) => any) => {
    if(channel in channels) {
      throw new Error(`A channel with the same name '${channel}' already exists!`)
    } else {
      channels[channel] = action
    }
  }
  
  const cancelChannel = (channel: string) => {
    if(channel in channels) {
      delete channels[channel]
    } else {
      throw new Error(`No such channel called '${channel}' added.`)
    }
  }
  
  const disband = () => {
    resolveFrom.removeListener('message', listener)
  }
  
  const listener = async (msg: ReqBody) => {
    if(msg.ipcSignature === signature && msg.uuid && msg.type === 'REQUEST') {
      let status: ResponseType = ResponseType.SUCCESS
      let payload: any = null
      if(msg.channel in channels) {
        try {
          payload = await Promise.resolve(channels[msg.channel](...msg.payload))
        } catch(err) {
          status = ResponseType.FAILED
          payload = err
        }
      } else {
        status = ResponseType.FAILED
        payload = new Error(`No such channel called '${msg.channel}' added.`)
      }
  
      if(resolveFrom.send) {
        resolveFrom.send({
          status,
          payload,
          uuid: msg.uuid,
          ipcSignature: signature,
          type: 'RESPONSE'
        } as ResBody)
      }
    }
  }

  resolveFrom.on('message', listener)

  return [
    addChannel,
    cancelChannel,
    disband
  ]
}


export interface ResBody {
  uuid: string,
  status: ResponseType,
  payload: any,
  ipcSignature: string,
  type: 'RESPONSE'
}

export enum ResponseType {
  SUCCESS,
  FAILED
}