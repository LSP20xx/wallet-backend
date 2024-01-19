interface IWalletService {
  createWallet(): { address: string; encryptedPrivateKey: string };
}

export { IWalletService };
