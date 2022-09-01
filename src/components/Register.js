import React , {Component} from 'react'
import '../styles/register.css'
import $ from 'jquery'
import io from 'socket.io-client'
import { storage } from '../firebase'
import {ref, uploadBytes,getDownloadURL} from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router'
const socket = io('http://localhost:5000')
class Register extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            email:"",
            password:"",
            username:"",
            profileimg:null
        }
    }

    onChangeEmail = (e) =>{
        this.setState({
            email: e.target.value
        })
    }

    onChangeUsername = (e)=>{
        this.setState({
            username:e.target.value
        })
    }

    onChangePassword = (e)=>{
        this.setState({
            password:e.target.value
        })
    }

    onSubmitClicked = (e) =>{
        var filename = uuidv4();
        const firebaseref = ref(storage,`/images/${filename}`)

        const metadata = {
            contentType: 'image/jpeg',
          };
          var current = new Date();
          const uploadTask = uploadBytes(firebaseref, this.state.profileimg, metadata).
          then(snapshot=>{
            getDownloadURL(snapshot.ref).then((url)=>

                socket.emit('register',{profileimg:url,
                                        description:"",
                                        posts:[],
                                        followers:[],
                                        following:[],
                                        email:this.state.email,
                                        username:this.state.username,
                                        password:this.state.password})
                .on("returnID",res=>{
                    console.log("res is ",res);
                    localStorage.setItem("user",JSON.stringify(res))
                    this.props.navToHome();
                }))

            })

    }

    onImgClicked (){
        $('#my_file').click();
    }

    onFileSelected = (e)=>{
        this.setState({
            profileimg:e.target.files[0]
        })
    }

    componentDidMount(){

    }
    render(){
        return(
            <div class = "backgroundview">
                 <div class = "registerpage">
                    <h3>Register</h3>
                    <form>
                        <div class = "inputfile">
                            <img id="previewimg" src = {this.state.profileimg == null? process.env.PUBLIC_URL+"/images/user.png":URL.createObjectURL(this.state.profileimg)} onClick={this.onImgClicked}></img>
                            <input type="file" id="my_file" onChange={this.onFileSelected}></input>
                        </div>
                        <div class="form-group">
                            <label for="exampleInputEmail1">Email address</label>
                            <input type="email" onChange={this.onChangeEmail} class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email"/>
                            <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
                        </div>

                        <div class="form-group">
                            <label for="exampleInputEmail1">Username</label>
                            <input type="email" onChange={this.onChangeUsername} class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email"/>
                        </div>

                        <div class="form-group">
                            <label for="exampleInputPassword1">Password</label>
                            <input type="password" onChange={this.onChangePassword} class="form-control" id="exampleInputPassword1" placeholder="Password"/>
                        </div>
                        <button type="submit" class="btn btn-primary" onClick = {this.onSubmitClicked}>Submit</button>

                        <div class = "registerbutton">
                                <span>Already have an account? <a href = "/Login">Login here!</a></span>
                            </div>
                    </form>
                 </div>
            </div>
        )
    }
}
function RegisterComponent(){
    const navigate = useNavigate();

    const navigateToHome =()=>{
        navigate("/");
    }
    return <Register navToHome = {navigateToHome}></Register>
}

export default RegisterComponent;