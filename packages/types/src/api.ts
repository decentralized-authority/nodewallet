
interface ErrorResult {
  error: Error
}

export interface RegisterUserParams {
  password: string
}
export interface RegisterUserResult {
  result: boolean
}
export interface GenerateMnemonicResult {
  result: string
}
export interface ServerAPI {

  handleRegisterUser(params: RegisterUserParams): Promise<RegisterUserResult|ErrorResult>

  handleGenerateMnemonic(): Promise<GenerateMnemonicResult|ErrorResult>

}
export interface ClientAPI {

  registerUser(params: RegisterUserParams): Promise<RegisterUserResult|ErrorResult>

  generateMnemonic(): Promise<GenerateMnemonicResult|ErrorResult>

}
