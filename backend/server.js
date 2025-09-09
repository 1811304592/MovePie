// 1. 导入所需模块
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// 2. 初始化 Express 应用
const app = express();

// 3. 设置中间件
app.use(cors()); // 允许前端跨域请求
app.use(express.json()); // 让 Express 能解析 JSON 格式的请求体

// 4. 定义 API 接口
app.post('/api/generate', (req, res) => {
    try {
        // 从前端请求中获取用户输入
        const { nftName, moduleName, projectName, isMintable } = req.body;

        // 读取主模板文件内容
        let finalCode = fs.readFileSync(path.join(__dirname, 'template.move'), 'utf8');

        // 使用正则表达式进行全局替换，替换所有通用占位符
        finalCode = finalCode.replace(/__NFT_NAME__/g, nftName || 'MyNFT');
        finalCode = finalCode.replace(/__MODULE_NAME__/g, moduleName || 'my_nft');
        finalCode = finalCode.replace(/__PROJECT_NAME__/g, projectName || 'my_project');

        // 根据条件（isMintable）决定是否插入 mint 逻辑
        if (isMintable) {
            const mintLogic = fs.readFileSync(path.join(__dirname, 'mint_logic.move_snippet'), 'utf8');
            finalCode = finalCode.replace('// __MINT_LOGIC__', mintLogic);
        } else {
            // 如果用户选择不可铸造，就用注释替换掉占位符
            finalCode = finalCode.replace('// __MINT_LOGIC__', '// Mint functionality was not included by user choice.');
        }
        
        // 将成功生成的代码以 JSON 格式返回给前端
        res.json({ generatedCode: finalCode });

    } catch (error) {
        console.error('Error during code generation:', error);
        res.status(500).json({ error: 'Failed to generate code.' });
    }
});

// 5. 启动服务器
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`✅ Backend server is running on http://localhost:${PORT}`);
});