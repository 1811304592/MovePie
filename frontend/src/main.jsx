import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// 1. 导入所需的模块
import '@mysten/dapp-kit/dist/index.css'; // 导入 dapp-kit 的默认样式
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 2. 创建 QueryClient 实例
const queryClient = new QueryClient();

// 3. 定义网络配置 (我们使用测试网 'testnet')
const networks = {
  testnet: { url: getFullnodeUrl('testnet') },
  // 你也可以添加其他网络
  // devnet: { url: getFullnodeUrl('devnet') },
  // mainnet: { url: getFullnodeUrl('mainnet') },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 4. 使用 Provider 包裹 App 组件 */}
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <App />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);