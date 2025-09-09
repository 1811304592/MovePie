import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// 我们不需要 index.css, 在 App.css 里写样式
// import './index.css' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)