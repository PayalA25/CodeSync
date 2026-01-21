
import './App.css';
import { Routes, Route } from "react-router-dom";
import EditorPage from "./component/EditorPage.js";
import Home from "./component/Home.js";
import { Toaster } from 'react-hot-toast';

function App() {
  return (
      <>
       <div>
      <Toaster  position='top-center'></Toaster>
    </div>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/editor/:RoomId" element={<EditorPage/>} />
      </Routes>
      </>
  
  );
}

export default App;
