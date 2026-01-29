import {io} from 'socket.io-client';

export const initSocket = async () =>{
    const options = {
        'force new connection': true,
          transports: ['websocket',"polling"],
        reconnectionAttempts : 10,
        timeout: 10000,
      
    };
    return io(import.meta.env.VITE_BACKEND_URL, options);
}