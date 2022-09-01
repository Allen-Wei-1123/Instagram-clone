import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";


import LoginComponent from './components/Login'
import NavBarComponent from './components/Navbar'
import HomeComponent from './components/Home'
import UserDetails from './components/User';
import RegisterComponent from './components/Register';


function App() {
  return (
    <Router>
      <NavBarComponent></NavBarComponent>
      <Routes>
        <Route exact path ="/" exact element={<HomeComponent></HomeComponent>}></Route>
          <Route exact path ="/Login" element={<LoginComponent></LoginComponent>}></Route>
          <Route  path = "/users/:id" exact element={<UserDetails></UserDetails>}></Route>
          <Route  path = "/register" exact element={<RegisterComponent></RegisterComponent>}></Route>
      </Routes>
    </Router>
  );
}


export default App;
