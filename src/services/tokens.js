export const tokenService = {
  mintTokens: async (amount) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true, txHash: '0x' + Math.random().toString(36).substr(2, 9) }), 1000);
    });
  },
  
  transferTokens: async (to, amount) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true, txHash: '0x' + Math.random().toString(36).substr(2, 9) }), 1000);
    });
  }
};