export interface IpcError extends Partial<Error> {
  raw: any,
  isNativeError: boolean
}

export function IpcErrorBuilder(error: any) {
  const result: IpcError = {
    raw: error,
    isNativeError: false
  }
  if(error instanceof Error) {
    result.isNativeError = true
    result.message = error.message
    result.name = error.name
    result.stack = error.stack
  }
  return result
}

export function ErrorThrower(ipcError: IpcError) {
  if(ipcError.isNativeError) {
    const error = new Error()
    error.message = ipcError.message ?? ''
    error.name = ipcError.name ?? ''
    error.stack = ipcError.stack ?? ''
    return error
  } else {
    return ipcError.raw
  }
}