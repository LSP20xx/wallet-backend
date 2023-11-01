interface IWalletService {
  createWallet(): { address: string; privateKey: string };
}

export { IWalletService };
