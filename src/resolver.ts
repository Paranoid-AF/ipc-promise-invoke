import { signature } from './constant'
import { ReqBody } from './sender'

const channels: Record<string, (...args: any) => any> = {}

const addChannel = (channel: string, action: (...args: any) => any) => {
  if(channel in channels) {
    throw new Error('A channel with the same name already exists!')
  } else {
    channels[channel] = action
  }
}

const cancelChannel = (channel: string) => {
  if(channel in channels) {
    delete channels[channel]
  } else {
    throw new Error('No such channel added to current process.')
  }
}

const disband = () => {
  process.removeListener('message', listener)
}

export const resolver = () => {
  process.on('message', listener)
  return {
    addChannel,
    cancelChannel,
    disband
  }
}

const listener = async (msg: ReqBody) => {
  if(msg.ipcSignature === signature && msg.uuid) {
    let status: ResponseType = ResponseType.SUCCESS
    let payload: any = null
    
    if(msg.channel in channels) {
      try {
        payload = await Promise.resolve(channels[msg.channel](msg.payload))
      } catch(err) {
        status = ResponseType.FAILED
        payload = err
      }
    } else {
      status = ResponseType.FAILED
      payload = new Error("No such channel added to the target resolver process.")
    }

    if(process.send) {
      process.send({
        status,
        payload,
        uuid: msg.uuid,
        ipcSignature: signature
      } as ResBody)
    }
  }
}

export interface ResBody {
  uuid: string,
  status: ResponseType,
  payload: any,
  ipcSignature: string
}

export enum ResponseType {
  SUCCESS,
  FAILED
}