import React,{Component} from 'react'
import '../styles/login.css'
import websocket from 'socket.io-client'
import io from "socket.io-client"
import { useNavigate } from 'react-router-dom'
const socket = io("http://localhost:5000")


class Login extends React.Component{
    
    constructor(props){
        super(props);
        this.state={
            email:"",
            password:"",
            navtoHome:false
        }

    }

    onSubmitForm =(e)=>{
        e.preventDefault();
        socket.emit('login',{email:this.state.email,password:this.state.password})
        .on("loginResult",data=>{
            console.log("data is ",data)
            localStorage.setItem("user",JSON.stringify(data[0]));
            this.setState({
                navtoHome:true
            })
            this.props.navToHome();
        }) 
    }

    onChangeEmail=(e)=>{
        this.setState({
            email:e.target.value
        })
    }

    onChangePassword = (e)=>{
        this.setState({
            password:e.target.value
        })
    }


    render(){
        let {navtoHome} = this.state
        return (
            
            <div class = "loginview">
                
                <div class= "loginpage">
                    <div class = "loginimg">
                        <img src = {process.env.PUBLIC_URL+"/images/instagram.jpeg"}></img>
                    </div>
                    <div class = "loginform">
                            <h3>Login</h3>
                            <form>
                            <div class="form-group">
                                <label for="exampleInputEmail1">Email address</label>
                                <input type="email" onChange={this.onChangeEmail} class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email"/>
                                <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
                            </div>
                            <div class="form-group">
                                <label for="exampleInputPassword1">Password</label>
                                <input type="password" onChange={this.onChangePassword} class="form-control" id="exampleInputPassword1" placeholder="Password"/>
                            </div>
                            
                            <button type="submit" class="btn btn-primary" onClick={this.onSubmitForm}>Login</button>
                            <div class = "registerbutton">
                                <span>Don't have an account? <a href = "/register">Sign up here!</a></span>
                            </div>
                            </form>
                    </div>
                </div>
                
            </div>
        );
    }
    
}


function LoginComponent(){
    const navigate = useNavigate();

    const navigateToHome = () =>{
        navigate('/')
    }

    const navigateToRegister = () =>{
        navigate('/register')
    }
    return (
        <Login navToHome = {navigateToHome} navToRegister = {navigateToRegister}></Login>
    )
}

// export default Login;
export default LoginComponent