import React, { useEffect, useRef, useState } from "react";
import Client from "./Client.jsx";
import Editor from "./Editor.jsx";
import { initSocket } from "../Socket.js";
import { ACTIONS } from "../Action.js";
import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

// List of supported languages
const LANGUAGES = [
  "python3",
  "java",
  "cpp",
  "nodejs",
  "c",
  "ruby",
  "go",
  "scala",
  "bash",
  "sql",
  "pascal",
  "csharp",
  "php",
  "swift",
  "rust",
  "r",
];

function EditorPage() {
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState("");
  const [isCompileWindowOpen, setIsCompileWindowOpen] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("java");
  const codeRef = useRef(null);

  const Location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const socketRef = useRef(null);


  useEffect(() => {
  //  Validate username
  if (!Location.state?.username) {
    toast.error("Username is missing!");
    navigate("/");
    return;
  }


    const init = async () => {
       //  Initialize socket
      socketRef.current = await initSocket();
      
      const handleErrors = (err) => {
        console.log("Error", err);
        toast.error("Socket connection failed, Try again later");
        navigate("/");
      };

      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

        // Join room
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: Location.state?.username,
        // safe because we already checked
      });

      // Handle new user joined
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== Location.state?.username) {
            toast.success(`${username} joined the room.`);
          }


          setClients((prevClients) => {
          const uniqueClients = new Map();
        [...prevClients, ...clients].forEach((client) => {
        uniqueClients.set(client.username, client);
       });
  return Array.from(uniqueClients.values());
});
});
socketRef.current.on(ACTIONS.LANGUAGE_CHANGE, ({ language }) => {
    setSelectedLanguage(language);
  });


      //     socketRef.current.emit(ACTIONS.SYNC_CODE, {
      //       code: codeRef.current,
      //       socketId,
      //     });
      //   }
      // );
      
      //  Handle user disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });


    };
    init();
    

    
   return () => {
  if (socketRef.current) {
    socketRef.current.off(ACTIONS.JOINED);
    socketRef.current.off(ACTIONS.LANGUAGE_CHANGE);
    socketRef.current.off(ACTIONS.DISCONNECTED);
    socketRef.current.disconnect();
  }
};

  }, [roomId]);


  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success(`Room ID is copied`);
    } catch (error) {
      console.log(error);
      toast.error("Unable to copy the room ID");
    }
  };

  const leaveRoom = async () => {
    navigate("/");
  };

  const runCode = async () => {
  if (!codeRef.current || codeRef.current.trim() === "") {
    toast.error("Please write some code first");
    return;
  }

  setIsCompiling(true);
  try {
    const response = await axios.post("http://localhost:5000/compile", {
      code: codeRef.current,
      language: selectedLanguage,
    });

    console.log("Backend response:", response.data);

    const { output, error } = response.data.data;

    if (error) {
      setOutput(error);
    } else {
      setOutput(output);
    }
  } catch (error) {
    console.error("Error compiling code:", error);
    setOutput(error.response?.data?.message || "An error occurred");
  } finally {
    setIsCompiling(false);
  }
};


  const toggleCompileWindow = () => {
    setIsCompileWindowOpen(!isCompileWindowOpen);
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      <div className="row flex-grow-1">
        {/* Client panel */}
        <div className="col-md-2 bg-dark text-light d-flex flex-column">
          <img
            src="/images/codesync.png"
            alt="Logo"
            className="img-fluid mx-auto"
            style={{ maxWidth: "150px", marginTop: "-43px" }}
          />
          <hr style={{ marginTop: "-3rem" }} />

          {/* Client list container */}
          <div className="d-flex flex-column flex-grow-1 overflow-auto">
            <span className="mb-2">Members</span>
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>

          <hr />
          {/* Buttons */}
          <div className="mt-auto mb-3">
            <button className="btn btn-success w-100 mb-2" onClick={copyRoomId}>
              Copy Room ID
            </button>
            <button className="btn btn-danger w-100" onClick={leaveRoom}>
              Leave Room
            </button>
          </div>
        </div>

        {/* Editor panel */}
        <div className="col-md-10 text-light d-flex flex-column ">
          {/* Language selector */}
          <div className="bg-dark p-2 d-flex justify-content-end">
            <select
              className="form-select w-auto"
              value={selectedLanguage}
            onChange={(e) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);

    socketRef.current.emit(ACTIONS.LANGUAGE_CHANGE, {
      roomId,
      language: lang,
    });
  }}
   >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          
  <Editor
    socketRef={socketRef}
    roomId={roomId}
    language={selectedLanguage}  
    onCodeChange={(code) => {
      codeRef.current = code;
    }}
  />


        </div>
      </div>

      {/* Compiler toggle button */}
      <button
        className="btn btn-primary position-fixed bottom-0 end-0 m-3"
        onClick={toggleCompileWindow}
        style={{ zIndex: 1050 }}
      >
        {isCompileWindowOpen ? "Close Compiler" : "Open Compiler"}
      </button>

      {/* Compiler section */}
      <div
        className={`bg-dark text-light p-3 ${
          isCompileWindowOpen ? "d-block" : "d-none"
        }`}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: isCompileWindowOpen ? "30vh" : "0",
          transition: "height 0.3s ease-in-out",
          overflowY: "auto",
          zIndex: 1040,
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0">Compiler Output ({selectedLanguage})</h5>
          <div>
            <button
              className="btn btn-success me-2"
              onClick={runCode}
              disabled={isCompiling}
            >
              {isCompiling ? "Compiling..." : "Run Code"}
            </button>
            <button className="btn btn-secondary" onClick={toggleCompileWindow}>
              Close
            </button>
          </div>
        </div>
        <pre className="bg-secondary p-3 rounded">
          {output || "Output will appear here after compilation"}
        </pre>
      </div>
    </div>
  );
}

export default EditorPage;