# GAVIN Infrastructure Project

GAVIN is a distributed blockchain infrastructure project that implements a multi-node architecture for secure data management and institutional access. The system consists of 8 specialized nodes that work together to provide a complete blockchain ecosystem.

## Architecture Overview

The GAVIN infrastructure is divided into 8 interconnected nodes:

1. **Public BAF Node** (`1_PublicBaf`) - Public Blockchain Access Framework and Portal
2. **Access Node** (`2_AccesNode`) - Besu Ethereum network node for access control
3. **Relayer Access Data** (`3_RelayerAccesData`) - Cross-chain communication relay
4. **Data Node** (`4_DataNode`) - Besu Ethereum network for data storage and management
5. **Relayer Data Institution** (`5_RelayerDataInsti`) - Institutional data relay
6. **Institution Node** (`6_InstiNode`) - Besu Ethereum network for institutional oprations
7. **Institution BAF** (`7_InstiBaf`) - Institutional Blockchain Access Framework
8. **Backup Node** (`8_Backup`) - System backup and certificate management

## Components

### 1. Public BAF Node
- **BAF**: Node.js/TypeScript backend service with Web3 integration
- **Portal Gavin**: SvelteKit frontend application with MetaMask integration
- Provides public access to the GAVIN network

### 2. Chain Nodes
- **Besu Node**: Hyperledger Besu Ethereum network
- Configured with QBFT consensus mechanism
- Multiple validators for network security

### 3. Relayer Components
- Smart contract deployment using Truffle
- Cross-chain communication using IBC (Inter-Blockchain Communication)
- Hyperledger Labs YUI IBC Solidity integration

## Prerequisites

Before deploying GAVIN infrastructure, ensure you have:

- **Docker & Docker Compose**: For containerized deployments
- **Node.js** (v18 or higher): For JavaScript/TypeScript applications
- **npm/yarn**: Package manager
- **Truffle**: For smart contract compilation and deployment
- **MetaMask**: For frontend wallet integration

## Installation & Deployment

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd GavinProject
2. **Set up environment variables**:
Each node requires its own `.env` file. Check individual node directories for required variables.

### Node-by-Node Deployment

##### 1. Deploy Access Node (Besu Network)
```bash
cd 2_AccesNode/BesuNode
./dirs.sh  # Create necessary directories
docker-compose -f compose.yml up -d
```

#### 2. Deploy Public BAF Services
```bash
# Backend BAF Service
cd 1_PublicBaf/BAF
npm install
npm run build
npm start

# Frontend Portal (in another terminal)
cd 1_PublicBaf/PortalGavin
npm install
npm run build
npm run preview
```

#### 3. Deploy Relayer Services
```bash
cd 3_RelayerAccesData/Relayer
npm install
npm run compile
npm run migrate:ibc0  # Deploy to first network
npm run migrate:ibc1  # Deploy to second network
```

#### 4. Deploy Institution Components
```bash
cd 7_InstiBaf/BAFData
npm install
npm start

cd 7_InstiBaf/PortalUni
npm install
npm run build
npm run preview
```

## Configuration

### Environment Variables

Each component requires specific environment variables:

- **Blockchain RPC URLs**: Configure connection to Besu networks
- **Private Keys**: For transaction signing and contract deployment
- **CORS Settings**: For cross-origin requests
- **Database Connections**: For data persistence
- **Certificate Paths**: For secure communications

### Network Configuration

The Besu network is configured with:
- Custom network ID
- QBFT consensus mechanism
- Multiple validator nodes
- RPC/WebSocket endpoints on specific ports

## Service Ports

Default service ports (configurable via environment):
- **Besu RPC Node**: 8545 (HTTP), 8546 (WebSocket)
- **Besu Validators**: 21001, 21002
- **BAF Backend**: 3000 (default Express port)
- **Portal Frontend**: 4173 (preview), 5173 (dev)

## Security Considerations

- All private keys should be stored securely and never committed to version control
- Use proper firewall configurations for production deployments
- Enable HTTPS/WSS for production environments
- Regularly backup blockchain data and configurations

## Development

### Running in Development Mode

```bash
# BAF Backend
cd 1_PublicBaf/BAF
npm run dev

# Portal Frontend
cd 1_PublicBaf/PortalGavin
npm run dev
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For support and questions, please refer to the individual component documentation in each node directory. If you have more doubts you can contact us on <gavin@uvigo.gal> or open an Issue.

---

**Note**: This is a complex distributed system. Ensure you understand the architecture and have proper infrastructure before deploying to production environments.
