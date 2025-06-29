# Blendifi - DeFi Platform on Stellar

A comprehensive decentralized finance (DeFi) platform built on the Stellar blockchain using Soroban smart contracts. Blendifi provides users with staking, swapping, and borrowing capabilities in a modern, user-friendly interface.

![Blendifi Logo](public/blendifi2.jpg)

## Features

### **Core DeFi Functions**
- **Staking**: Stake BLEND tokens to earn rewards
- **Token Swapping**: Swap between XLM, USDC, and BLEND tokens
- **Borrowing**: Borrow assets against your collateral
- **Portfolio Dashboard**: Real-time portfolio tracking and health monitoring

### **Wallet Integration**
- **Freighter Wallet**: Seamless integration with Freighter wallet extension
- **Secure Transactions**: All transactions signed through Freighter
- **Multi-Network Support**: Testnet and mainnet compatibility

### **Smart Contract Features**
- **Soroban Smart Contracts**: Deployed on Stellar testnet
- **Real-time Data**: Live contract data and position tracking
- **Health Monitoring**: Risk assessment and liquidation warnings

## Technology Stack

### **Frontend**
- **React 19** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **CSS3** - Modern styling with CSS custom properties

### **Blockchain Integration**
- **Stellar SDK** - Stellar blockchain interaction
- **Soroban Client** - Smart contract interaction
- **Freighter API** - Wallet integration and transaction signing

### **Development Tools**
- **ESLint** - Code linting and quality assurance
- **Git** - Version control
- **npm** - Package management

## Getting Started

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- Freighter wallet extension installed

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blendifi_stellar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### **Wallet Setup**

1. **Install Freighter Wallet**
   - Download from [https://www.freighter.app/](https://www.freighter.app/)
   - Install the browser extension

2. **Connect to Testnet**
   - Open Freighter wallet
   - Switch to "Testnet" network
   - Get some testnet XLM from the faucet

3. **Connect to Blendifi**
   - Click "Connect Wallet" in the app
   - Approve the connection in Freighter

## Usage Guide

### **Staking BLEND Tokens**
1. Navigate to the **Stake** page
2. Enter the amount of BLEND you want to stake
3. Click "Stake Tokens"
4. Approve the transaction in Freighter
5. View your staking rewards in the Dashboard

### **Swapping Tokens**
1. Go to the **Swap** page
2. Select the token you want to swap from
3. Select the token you want to swap to
4. Enter the amount
5. Review the exchange rate and fees
6. Click "Swap Tokens" and approve in Freighter

### **Borrowing Assets**
1. Visit the **Borrow** page
2. Select the asset you want to borrow
3. Enter the amount
4. Review your collateral ratio
5. Click "Borrow Asset" and approve the transaction

### **Portfolio Dashboard**
- View your total portfolio value
- Monitor staking rewards
- Track borrowed amounts
- Check your health status
- See real-time token balances

## Smart Contract Details

### **Deployed Contract**
- **Contract Address**: `CC...ABCD` (Soroban testnet)
- **Network**: Stellar Testnet
- **Functions**: stakeBlend, swapTokens, borrowAsset, getUserPosition, getHealthStatus

### **Supported Tokens**
- **XLM** - Native Stellar token
- **USDC** - USD Coin on Stellar
- **BLEND** - Blendifi platform token

## UI/UX Features

### **Modern Design**
- Clean, minimalist interface
- Responsive design for all devices
- Smooth animations and transitions
- Professional branding with Blendifi logo

### **User Experience**
- Intuitive navigation
- Real-time feedback
- Error handling and validation
- Loading states and progress indicators

### **Accessibility**
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Mobile-responsive design

## Security Features

### **Wallet Security**
- All transactions require user approval
- Private keys never leave Freighter wallet
- Secure transaction signing
- Network validation

### **Smart Contract Security**
- Audited Soroban contracts
- Proper access controls
- Emergency pause functionality
- Liquidation protection

## Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Git
git add .            # Stage all changes
git commit -m "msg"  # Commit changes
git push             # Push to remote
```

## Deployment

### **Build for Production**
```bash
npm run build
```

### **Deploy to Vercel/Netlify**
1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- **Documentation**: Check the code comments and this README
- **Issues**: Report bugs via GitHub Issues
- **Discord**: Join our community for support

## Roadmap

- [ ] Mainnet deployment
- [ ] Additional token support
- [ ] Advanced trading features
- [ ] Mobile app development
- [ ] Governance token integration
- [ ] Cross-chain bridges

---

**Built with ❤️ on Stellar**
