import React , { useState }  from 'react'; 
import { v4 as uuid } from "uuid";
import { toast } from 'react-toastify';

import { useNavigate } from "react-router-dom";

function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const Id = uuid();
    setRoomId(Id);
    toast.success("Room Id is generated");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Both the field is requried");
      return;
    }

    // redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
    toast.success("room is created");
  };
  
  return (
    <div className="container-fluid">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-12 col-md-6">
          <div className="card shadow-sm p-2 mb-5 bg-secondary rounded">
            <div className="card-body text-center bg-dark">
              <img src="/images/codesync.png" 
                
                alt="Logo"
                className="img-fluid mx-auto d-block"
                style={{ maxWidth: "150px" }}
              />
              
                <h4 className='card-tittle text-light mb-4'>Enter thr ROOM ID</h4>
            
              
                <div className="form-group">
                  <input type="text"
                   value={roomId}
                   onChange={(e) => setRoomId(e.target.value)}
                   className="form-control mb-2"
                    placeholder='ROOM ID' />
                </div>
                <div className="form-group">
                  <input type="text" 
                   value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-control mb-2" 
                  placeholder='USER NAME' />
                </div>
             

                <button type="button" 
                className="btn btn-success  btn-lg btn-block"
                onClick={joinRoom}
                >Join</button>
              
              
                <p className='text-light mt-3'> Don't have a room ID? 
                <span
                 onClick={generateRoomId}
                 className='text-success p-2' 
                 style={{cursor: "pointer"}} 
                 >
                   {"    "}New Room
               </span>
            </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home;
