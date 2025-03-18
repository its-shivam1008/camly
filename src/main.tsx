import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Room from './components/Room.jsx';
import Home from './components/Home.js';
import Classes from './components/Classes.js';
import { store } from './redux/store.js';
import { Provider } from 'react-redux';
import Login from './components/Login.js';
import Signup from './components/Signup.js';
// import Home from "./components/Home.js";

const router = createBrowserRouter([
  {
    path:'/',
    element:<App />,
    children:[
      {
        path:"/",
        element:<Home/>
      },
      {
        path:"/room/:roomId",
        element:<Room/>
      },
      {
        path:"/class",
        element:<Classes/>
      },
      {
        path:"/login",
        element:<Login/>
      },
      {
        path:"/signup",
        element:<Signup/>
      }
    ]
  }
])


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}/>
    </Provider>
  </StrictMode>,
)
