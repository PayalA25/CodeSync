
import './App.css';
import { Routes, Route } from "react-router-dom";
import EditorPage from "./component/EditorPage.jsx";
import Home from "./component/Home.jsx";
import { Toaster } from 'react-hot-toast';

function App() {
  return (
      <>
       <div>
      <Toaster  position='top-center'></Toaster>
    </div>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/editor/:roomId" element={<EditorPage/>} />
      </Routes>
      </>
  
  );
}

export default App;
