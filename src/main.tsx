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
import Verification from './components/Verification.js';
import UserLayout from './components/UserLayout.js';
import CreateClass from './components/CreateClass.js';
import GetClasses from './components/GetClasses.js';
import UpdateClass from './components/UpdateClass.js';
import TeacherstartClass from './components/TeacherStartClass.js';

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
      },
      {
        path:'/verify',
        element:<Verification />
      },
      {
        path:'/teacher',
        element:<UserLayout/>,
        children:[
          {
            path:'/teacher',
            element:<CreateClass/>
          },
          {
            path:'/teacher/classes',
            element:<GetClasses/>
          },
          {
            path:'/teacher/update',
            element:<UpdateClass/>
          },
          {
            path:"/teacher/class/:classId",
            element:<TeacherstartClass/>
          },
        ]
      }
    ]
  }
])


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}/>
    </Provider>
  </StrictMode>
)
