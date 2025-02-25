import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Room from './components/Room.jsx';
import Home from './components/Home.js';
// import Home from "./components/Home.js";

const router = createBrowserRouter([
  {
    path:'/',
    element:<App />, // maybe about 
    children:[
      {
        path:"/",
        element:<Home/>
      },
      {
        path:"/room",
        element:<Room/>
      },
    ]
  }
])


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <BrowserRouter> */}
    <RouterProvider router={router}/>
    {/* <Navbar/> */}
      {/* <App /> */}
    {/* </BrowserRouter> */}
  </StrictMode>,
)
