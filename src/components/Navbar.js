import React , {Component,Fragment} from 'react';
import '../styles/navbar.css'
import '../styles/postarea.css'
import $ from 'jquery'
import { empty } from 'prelude-ls';
import {storage} from '../firebase'
import {ref, uploadBytes,getDownloadURL} from 'firebase/storage'
import io from "socket.io-client"
import User from './User';
import { Link,useNavigate,NavLink} from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid';


function postarea(changeimgviewaction,onSubmitClicked, onchangeDescription, onStoriesEnabled){
    function imageselected(event){
        console.log(event.target.files[0])
        console.log(URL.createObjectURL(event.target.files[0]))
        $("#previewimg").attr('src',URL.createObjectURL(event.target.files[0]))
        changeimgviewaction(event.target.files[0])
    }

    function onchangeImageFilter(e){
        var bright = "brightness("+$("#customRange1").val()+"%)" 
        var blur = "blur("+$("#customRange2").val()+"px)"
        var gray = "grayscale("+$("#customRange3").val()+"%)"
        var opacity = "opacity("+$("#customRange4").val()+"%)"
        $("#previewimg").css({
            WebkitFilter: bright + " " + blur + " " + gray+ " " + opacity 
        })
    }

    function closemodal(e){
        if(e.target.id == "postmodal"){
            $(".postmodal").css("display","none")
        }
    }    



    function updateDescription(e){
        var str = e.target.value;
        onchangeDescription(str);
    }

    function printCheckboxval(e){
        if ($('#StoriesCheckBox').is(":checked"))
        {
            onStoriesEnabled(true)
        }else{
            onStoriesEnabled(false);
        }
    }

    return (
        <div class = "postmodal" id = "postmodal" onClick={closemodal}>
                <div class = "postmodalcontent">
                    <div class = "imgview">
                        <div class = "wrapper">
                            <img id = "previewimg" src = {process.env.PUBLIC_URL+"/images/photo.png"}></img>
                        </div>

                        <div class = "navbarinputfile">
                            <input type="file" id = "file" accept="image" onChange={imageselected}/>
                            <label for = "file">Choose a Photo</label>
                        </div>
                        
                    </div>
                    <div class = "rangeview">
                        <label for="customRange1" class="form-label">Brightness</label>
                        <input type="range" onChange={onchangeImageFilter}  class="form-range"  min="0" max="500" id="customRange1"/>

                        <label for="customRange2" class="form-label">Blur</label>
                        <input type="range" onChange={onchangeImageFilter} class="form-range"  min="0" max="500" id="customRange2"/>

                        <label for="customRange3" class="form-label">Gray Scale</label>
                        <input type="range" onChange={onchangeImageFilter} class="form-range"  min="0" max="500" id="customRange3"/>

                        <label for="customRange4" class="form-label">Opacity</label>
                        <input type="range" onChange={onchangeImageFilter} class="form-range"  min="0" max="500" id="customRange4"/>

                        <textarea class="form-control" onChange={updateDescription} placeholder="Write something..." id="exampleFormControlTextarea1" rows="3"></textarea>
                        <div class="checkboxDiv">
                            <label>
                                <input type="checkbox" id="StoriesCheckBox" data-toggle="toggle" onChange={printCheckboxval}/>
                                Post in Stories
                            </label>
                        </div>

                        <button type="button" class="btn btn-primary" onClick={onSubmitClicked}>
                            Submit
                        </button>
                    </div>
                </div>
        </div>
    )
}
class Navbar extends React.Component{

    constructor(props){
        super(props);
        this.state=({
            users:[],
            filtered:[],
            StoriesEnable:false,
        })
    }

    componentDidMount(){
       
        $(document).click((e)=>{
                if($(e.target).is("#searchinput")){
                    $('.autocomplete').css('visibility','visible')
                }else{
                    $('.autocomplete').css('visibility','hidden')
                }
        })
        this.state = {filename:0}
        const socket = io("http://localhost:5000");
        socket.emit("getusers").on("returnallusers",data=>{
                this.setState({users:data,inputuser:"",checkNavigate : false})
        })
    }

    onStoriesEnabled = (val)=>{
        this.setState({
            StoriesEnable:val
        })
    }

    onchangeimgview = (val) =>{
        this.setState({
            filename:val
        })
    }

    onchangeDescription = (val) =>{
        this.setState({
            description:val
        })
    }
     openmodal=()=>{
        $(".postmodal").css("display","block")
    }

    onSubmitClicked = () =>{
        var obj = localStorage.getItem("user")
        var stringify = JSON.parse(obj);
        const socket = io("http://localhost:5000")
        const filename = uuidv4();
        const tmp = ref(storage,`/images/`+filename)
        const metadata = {
            contentType: 'image/jpeg',
          };
          var current = new Date();
          const uploadTask = uploadBytes(tmp, this.state.filename, metadata).
          then(snapshot=>{
            getDownloadURL(snapshot.ref).then(url=>
                
                socket.emit("postimage",{img:url,
                        description:this.state.description,
                        time: current.toLocaleString(),
                        posterid: stringify['_id'],
                        author:stringify.username,
                        storiesEnable: this.state.StoriesEnable,
                    }) )
            })
           
            $(".postmodal").css("display","none")
          
    }
    
    onSearchChange =(e)=>{
        console.log(e.target.value)
        const result = this.state.users.filter(user=>user.username.toLowerCase().startsWith(e.target.value.toLowerCase()))
        this.setState({filtered:result})
    }

    openUserOptions = (e)=>{
        $(".dropdowns").css("display","block")
    }

    closeUserOptions = (e)=>{
        $(".dropdowns").css('display','none')
    }

    onViewProfileClicked =(e)=>{
        const userid = JSON.parse(localStorage.getItem("user"))._id;
        this.props.navToUser(userid)
    }

    onSignOutClicked =(e)=>{
        localStorage.removeItem('user')
        this.props.navToLogin();
    }

    render(){
        return (
            <Fragment>
                <div class = "navbar">
                    
                    <div class = "logo">
                        Instagram
                    </div>
                    <div class = "searchbox">
                        <input id = "searchinput" onChange={this.onSearchChange} type="text" placeholder="Search" ></input>
                        <div class = "autocomplete">
                            <ul>
                                 {
                                    this.state.filtered.map((user)=>{
                                       return  <li>
                                                      <img src = {user.profileimage}></img>
                                                     <div class = "searchname">
                                                            <NavLink  to={{ pathname: "/users/"+user._id}}>{user.username}</NavLink>
                                                     </div>
                                        </li>
                                    })
                                 }
                            </ul>
                        </div>
                    </div> 
                    <div class = "options">
                        <ul class = "optionstable">
                            <li onClick={()=>{this.props.navToHome()}}>
                                <img src = {process.env.PUBLIC_URL+"/images/home.png"} ></img>
                            </li>
                            <li>
                                <img src = {process.env.PUBLIC_URL+"/images/messenger.png"}></img>
                            </li>
                            <li>
                                <button onClick={this.openmodal} id ="morebutton"><img src = {process.env.PUBLIC_URL+"/images/more.png"}></img></button>
                            </li>
                            <li>
                                <button onMouseOver={this.openUserOptions} onMouseOut={this.closeUserOptions} id ="morebutton"><img src = {process.env.PUBLIC_URL+"/images/user.png"}></img></button>
                                 <div onMouseOver={this.openUserOptions}  onMouseOut={this.closeUserOptions}  class = "dropdowns">
                                    <ul class = "dropdownsList">
                                        <li  onClick={this.onViewProfileClicked}>
                                          <span><img src = {process.env.PUBLIC_URL+"/images/userdrop.png"}></img></span>  
                                          <span>View Profile</span>
                                        </li>
                                        <li   >
                                          <span><img src = {process.env.PUBLIC_URL+"/images/settings.png"}></img></span>  
                                          <span>Settings</span>
                                        </li>
                                        <li  onClick={this.onSignOutClicked}>
                                            Sign Out
                                        </li>
                                    </ul>
                                </div>
                            </li>
                            
                        </ul>
                    </div> 
                </div>
                {
                    postarea(this.onchangeimgview,this.onSubmitClicked,this.onchangeDescription,this.onStoriesEnabled)
                }
            </Fragment>
        )
    }
}


function NavBarComponent(){
    const navigate = useNavigate();
    const navigateToUser = (id)=>{
        navigate('/users/'+id)
    }

    const navigateHome = () =>{
        navigate("/");
    }

    const navigateLogin = () =>{
        navigate("/Login")
    }
    return (
        <Navbar navToUser = {navigateToUser} navToHome ={navigateHome} navToLogin={navigateLogin}></Navbar>
    )
}
export default NavBarComponent;