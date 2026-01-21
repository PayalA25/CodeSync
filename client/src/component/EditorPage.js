import React, { useEffect, useRef, useState } from 'react'
//import Client from "./Client.js"; 
import Client from "./Client";
import Editor from './Editor';
import { initSocket } from '../socket';



function EditorPage() {
  const socketRef = useRef(null);


    useEffect(() =>{
      const init = async () =>{
        socketRef.current = await initSocket();
      };
      init();
    })


  
   const [clients , setClients] = useState([
    { socketId : 1 , username :"payal"},
     { socketId : 2 , username :"samu"},
   ]);
  return (
    
     <div className="container-fluid vh-100 d-flex flex-column">
      <div className="row flex-grow-1">
        {/* Client panel */}
        <div className="col-md-2 bg-dark text-light d-flex flex-column h-100">
          <img
            src="/images/codesync.png"
            alt="Logo"
            className="img-fluid mx-auto"
            style={{ maxWidth: "150px", marginTop: "-43px" }}
          />
          <hr style={{ marginTop: "-3rem" }} />

          {/* Client list container */}
          <div className="d-flex flex-column flex-grow-1 overflow-auto ">
            <span className="mb-2">Members</span>
           {clients.map((client) =>(
             <Client  key={client.socketId} username={client.username}/>

           ))}
          </div>

          {/* Buttons */}
          <div className="mt-auto mb-3">
             <hr />
            <button className="btn btn-success" >
              Copy Room ID
            </button>
            <button className="btn btn-danger mt-2 mb-2 px-3 btn-block" >
              Leave Room
            </button>
          </div>
        </div>

        {/* Editor panel */}
        <div className="col-md-10 text-light d-flex flex-column h-100">
          <Editor/>
          {/* Language selector */}
          <div className="bg-dark p-2 d-flex justify-content-end">
            <select
              className="form-select w-auto"
            >
            </select>
          </div>

      
        
        </div>
      </div>

      
      </div>
   
  )
}

export default EditorPage
