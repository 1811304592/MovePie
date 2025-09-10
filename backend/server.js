const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { execa } = require('execa');
const fse = require('fs-extra');

const app = express();
app.use(cors());
app.use(express.json());

// Multer 配置 (保持不变)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// /api/generate 接口 (保持不变)
app.post('/api/generate', (req, res) => {
    try {
        const { nftName, moduleName, projectName, isMintable, description } = req.body;
        let imageUrl = '';
        if (req.file) {
            imageUrl = `http://localhost:3001/uploads/${req.file.filename}`;
        }
        let finalCode = fs.readFileSync(path.join(__dirname, 'template.move'), 'utf8');
        finalCode = finalCode.replace(/__NFT_NAME__/g, nftName || 'MyNFT');
        finalCode = finalCode.replace(/__MODULE_NAME__/g, moduleName || 'my_nft');
        finalCode = finalCode.replace(/__PROJECT_NAME__/g, projectName || 'my_project');
        finalCode = finalCode.replace(/__NFT_DESCRIPTION__/g, description || 'A generated NFT');
        finalCode = finalCode.replace(/__NFT_IMAGE_URL__/g, imageUrl || 'https://example.com/default.png');
        if (isMintable) {
            let mintLogic = fs.readFileSync(path.join(__dirname, 'mint_logic.move_snippet'), 'utf8');
            mintLogic = mintLogic.replace(/__NFT_NAME__/g, nftName || 'MyNFT');
            mintLogic = mintLogic.replace(/__NFT_DESCRIPTION__/g, description || 'A generated NFT');
            mintLogic = mintLogic.replace(/__NFT_IMAGE_URL__/g, imageUrl || 'https://example.com/default.png');
            finalCode = finalCode.replace('// __MINT_LOGIC__', mintLogic);
        } else {
            finalCode = finalCode.replace('// __MINT_LOGIC__', '// Mint functionality was not included by user choice.');
        }
        res.json({ generatedCode: finalCode });
    } catch (error) {
        console.error('Error during code generation:', error);
        res.status(500).json({ error: 'Failed to generate code.' });
    }
});


// /api/compile 接口 (有重要修改)
app.post('/api/compile', async (req, res) => {
    const { moveCode, projectName } = req.body;
    const tempDir = path.join(__dirname, 'temp', `proj_${Date.now()}`);
    const sourcesDir = path.join(tempDir, 'sources');

    try {
        await fse.ensureDir(sourcesDir);
        const tomlContent = `
[package]
name = "${projectName}"
version = "0.0.1"
[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/testnet" }
[addresses]
${projectName} = "0x0"
`;
        await fse.writeFile(path.join(tempDir, 'Move.toml'), tomlContent);
        await fse.writeFile(path.join(sourcesDir, 'my_module.move'), moveCode);

        console.log(`Building package in ${tempDir}...`);
        await execa('sui', ['move', 'build'], { cwd: tempDir });

        const buildDir = path.join(tempDir, 'build', projectName, 'bytecode_modules');
        const allFilesAndDirs = await fse.readdir(buildDir);

        // ✅ 关键修正：只选择 .mv 文件，过滤掉任何可能的子文件夹
        const compiledModules = allFilesAndDirs
            .filter(item => item.endsWith('.mv'))
            .map(file => {
                return fs.readFileSync(path.join(buildDir, file)).toString('base64');
            });
        
        const buildInfo = JSON.parse(fs.readFileSync(path.join(tempDir, 'BuildInfo.json'), 'utf8'));
        const suiDependencyKey = Object.keys(buildInfo.dependencies).find(key => key.toLowerCase() === 'sui');
        const dependencies = suiDependencyKey ? [buildInfo.dependencies[suiDependencyKey]] : [];

        if (dependencies.length === 0) {
            throw new Error("Could not find Sui dependency digest in BuildInfo.json");
        }
        
        res.json({
            modules: compiledModules,
            dependencies: dependencies
        });

    } catch (error) {
        console.error('Compilation failed:', error);
        res.status(500).json({ error: 'Compilation failed.', details: error.message });
    } finally {
        await fse.remove(tempDir);
        console.log(`Cleaned up temporary directory: ${tempDir}`);
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`✅ Backend server is running on http://localhost:${PORT}`);
    console.log(`✅ Images will be served from http://localhost:${PORT}/uploads`);
});