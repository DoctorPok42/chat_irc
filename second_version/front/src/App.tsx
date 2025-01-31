import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import Login from './Login';
import Chat from './Chats';
import "./styles/globals.scss"
import Cookies from "universal-cookie";
import emitEvent from "./tools/webSocketHandler";

const Chats = () => {
  const { id } = useParams();
  return id ? <Chat id={id} /> : <Chat id='' />;
}

const cookies = new Cookies();
const token = cookies.get("token");
emitEvent("verifyToken", { token }, (data: any) => {
    if (data.success) {
      window.location.href = "/chats";
    }else{
      cookies.remove("token", { path: "/" });
    }
  });

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
         <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chats" element={<Chat id='' />} />
        <Route path="/chats/:id" element={<Chats />} />

        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
