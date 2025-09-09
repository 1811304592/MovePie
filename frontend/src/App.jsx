import React, { useState } from 'react';
import './App.css';

function App() {
  // 使用 state 存储表单数据
  const [formData, setFormData] = useState({
    nftName: 'MyAwesomeNFT',
    moduleName: 'my_awesome_nft',
    projectName: 'my_project',
    isMintable: true,
  });

  // 使用 state 存储后端返回的代码
  const [generatedCode, setGeneratedCode] = useState('// Your generated Move code will appear here...');
  const [isLoading, setIsLoading] = useState(false);

  // 当表单输入变化时，更新 state
  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 当点击“生成代码”按钮时，提交数据到后端
  const handleSubmit = async (event) => {
    event.preventDefault(); // 防止页面刷新
    setIsLoading(true);
    setGeneratedCode('// Generating code, please wait...');

    try {
      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedCode(data.generatedCode);

    } catch (error) {
      console.error('Error generating code:', error);
      setGeneratedCode(`// Error generating code. Please check the console (and make sure backend is running).\n// ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>MovePie v0.1: Form Generator 🥧</h1>
      </header>
      <main className="container">
        <form className="form-panel" onSubmit={handleSubmit}>
          <h2>Configuration</h2>
          
          <label htmlFor="nftName">NFT Struct Name (PascalCase, e.g., MyAwesomeNFT):</label>
          <input type="text" id="nftName" name="nftName" value={formData.nftName} onChange={handleInputChange} required />
          
          <label htmlFor="moduleName">Module Name (snake_case, e.g., my_awesome_nft):</label>
          <input type="text" id="moduleName" name="moduleName" value={formData.moduleName} onChange={handleInputChange} required />

          <label htmlFor="projectName">Project Name (in Move.toml, e.g., my_project):</label>
          <input type="text" id="projectName" name="projectName" value={formData.projectName} onChange={handleInputChange} required />

          <div className="checkbox-group">
            <input type="checkbox" id="isMintable" name="isMintable" checked={formData.isMintable} onChange={handleInputChange} />
            <label htmlFor="isMintable">Make it Mintable?</label>
          </div>
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Code'}
          </button>
        </form>

        <div className="code-panel">
          <h2>Generated Code</h2>
          <pre><code>{generatedCode}</code></pre>
        </div>
      </main>
    </div>
  );
}

export default App;