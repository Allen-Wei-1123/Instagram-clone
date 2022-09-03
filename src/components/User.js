import React , {Component, Fragment,useState} from 'react'
import {Button,Modal} from 'react-bootstrap'
import UserList from './UserList'
import '../styles/users.css'
import $ from 'jquery'
import io from "socket.io-client"
import {useParams,useNavigate} from 'react-router-dom'
import { withRouter } from "react-router";
import { getByTestId } from '@testing-library/react'
import { FollowClicked,Unfollowclicked } from './FollowButtons'
const socket = io('http://localhost:5000')

function posts(userposts,onClickedimg){
    function showforeground(event){
        $("#showlikes"+event.target.id).css('visibility','visible');
    }
    function openpostcard(img,postid,comments,likes,description){
            $('.pmodal').css('display','block')
            onClickedimg(img,postid,comments,likes,description)
    }
    

    function hideforeground(event){
        $("#showlikes"+event.target.id).css('visibility','hidden');
    }
    var idcount = 0 ;
    return(
        <Fragment>
            <div class = "postsview">
                {
                    userposts.map((mypost)=>{
                        return <div class = "mygrid" key = {mypost._id} onMouseOver ={showforeground} onMouseOut= {hideforeground} onClick = {()=>openpostcard(mypost.img,mypost._id,mypost.comments,mypost.likes,mypost.description)}>
                            <img  id = {''+(idcount)} src = {mypost.img }></img>
                            <div id={"showlikes"+(idcount++)} class = "showlikes" >
                                {  (mypost.likes == undefined ? 0 : mypost.likes.length) +" Likes"}
                            </div>
                        </div>
                    })
                }
            </div>
        </Fragment>
    )
}



function CheckFollowers(posts,
                    followers,
                    following,
                    openfunction,openList,openTitleFunction, openTitle,
                    UpdateFollowing){
    var retlist = [];
    function handleOpen(event){
        $('.fmodal').css('display','block')
        if(event.target.id == "Followers"){
            openfunction(followers)
            openTitleFunction("Followers")
        }else{
            openfunction(following)
            openTitleFunction("Following")
        }
    }
    function handleClose(event){
        if(event.target.id == "modal"){
            $('.fmodal').css('display','none')
        }
    }

    

    return(
        <Fragment>
            <div class="profilefollowers">
                                <div class = "postdiv" >
                                    <span class ="profilenumber">{posts.length}</span> 
                                    <span class = "profilelabel">Post</span>
                                </div>
                                <div class = "followerdiv" id ="Followers" onClick={handleOpen}>
                                    <span class ="profilenumber" id ="Followers">{followers.length}</span> 
                                    <span class = "profilelabel" id ="Followers">Follower</span>
                                </div>
                                <div class = "followingdiv" id = "following" onClick={handleOpen}>
                                    <span class ="profilenumber" id ="Following">{following.length}</span> 
                                    <span class = "profilelabel" id ="Following">Following</span>
                                </div>
            </div>
            <div class ="fmodal" id = "modal"  onClick={handleClose} >
                <div class = "modalcontent">
                    <h3>{openTitle}</h3>
                    <ul class="list-group">
                        <li class="list-group-item">
                            <UserList  listitems = {openList} 
                                UpdateFollowingfunction = {UpdateFollowing}
                             ></UserList>
                        </li>
                    </ul>
                </div>
            </div>
        </Fragment>
    )
}

function EditProfile(useremail,userdescription,setuserdescription){
    function handleOpen(){
        $('.modal').css('display','block')
    }
    function handleClose(event){
        console.log("event ",event)
        if(event.target.id == "modal"){
            $('.modal').css('display','none')
        }
    }

    function onSubmitEditProfile(){
        
        const info = {email:$("#exampleInputEmail1").val(),description:$("textarea#edittextarea").val()}
        console.log("hello world",info);
        socket.emit("UpdateDescription",info)
        $('.modal').css('display','none')
        setuserdescription($("textarea#edittextarea").val())
    }
    return ( 
        <Fragment>
            <div class = "username">
                <button type="button" class="btn btn-dark" onClick = {handleOpen} >Edit Profile</button>
            </div>
            <div class ="modal" id = "modal" onClick={handleClose} >
                <div class = "modalcontent">
                    <h3>Information</h3>
                        <div class="form-group">
                            <label for="exampleInputEmail1">Email address</label>
                            <input disabled type="email" value = {useremail}  class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email"/>
                        </div>
                        
                        <div class="form-group">
                            <label for="exampleFormControlTextarea1">Intro</label>
                            <textarea class="form-control" id="edittextarea" >{userdescription}</textarea>
                        </div>
                        <button id = "submitedit" class="btn btn-primary" onClick={onSubmitEditProfile}>Save</button>
                </div>
            </div>
        </Fragment>
        
    )
}

function getUserDetails(myid,assignuser,assignposts){
    console.log("getting user details ",myid)
    const newsocket = io("http://localhost:5000")
    newsocket.emit("finduser",{id:myid}).on("getUserDetail",res=>{
        assignuser(res)
    }).on("getUserPosts",res=>{
        console.log("posts are ",res);
        assignposts(res);
    })

}

function bigcard(likeslist,
                postcontent,
                postcomments,
                userid,
                username,
                profileimg,
                clickedpostid,
                insertcommentfunction,
                navToUserfunction,
                pushLikes,
                removeLike,
                description
                ){
    function commentcard(img,username,description,posterid){
        return (
                <div class = "listdiv">
                    <img src = {img}></img>
                    <div class = "listdivcomment">
                        <span onClick={()=>{navToUserfunction(posterid)}}>{username}</span> {description}
                    </div>
                </div>
        )
    }
    function onSubmitComment(){
        let comments = $("#postcomment").val();
        let thisuser = JSON.parse(localStorage.getItem("user"))
        let info = {posterusername:thisuser.username,
                    description:comments,
                    img:thisuser.profileimage,
                    time: Date().toLocaleString(),
                    author:userid,
                    postid: clickedpostid,
                    posterid: thisuser._id
                }

                console.log(info)

        socket.emit("insertcomment",info).on("returncomments",res=>{
            insertcommentfunction({img:info.img,author:info.posterusername,description:info.description,posterid:thisuser._id},clickedpostid)
        })
        $("#postcomment").val("")
    }

    

    function followbutton(){
        const userfollowing = JSON.parse(localStorage.getItem("user")).following
        const res = userfollowing.find((element)=>element.author == userid);
        if(userid == JSON.parse(localStorage.getItem("user"))._id){
            return <div class = "personname">{username}</div>
        }else if(res){
            const detail = {source: {}}
            return   <div class = "personname">{username} <span onClick={()=>{Unfollowclicked()}}>&nbsp;&nbsp;&middot;&nbsp;Unfollow</span></div>
        }
        else{
            return <div class = "personname">{username} <span onClick ={()=>{FollowClicked()}}>&nbsp;&nbsp;&middot;&nbsp;Follow</span></div>
        }
    }

    function onLikeClicked(){
        const user =JSON.parse(localStorage.getItem("user"));
        const ret = {postid:clickedpostid,authorid:user._id,name:user.username,profileimage:user.profileimage}
        socket.emit("onLikeClicked",ret);
        pushLikes(clickedpostid,ret);
    }

    function onUnlikeclicked(){
        const user =JSON.parse(localStorage.getItem("user"));
        const info = {authorid:user._id , postid:clickedpostid}
        socket.emit("Unlikeclicked",info)
        removeLike(clickedpostid,info);
    }

    function DisplayHeartButton(){
        const user = JSON.parse(localStorage.getItem("user"))
        if(likeslist.find((element)=>element.authorid == user._id)){
            return <img src = {process.env.PUBLIC_URL+"/images/redheart.png" } onClick={onUnlikeclicked}></img>
        }else{
            return <img src = {process.env.PUBLIC_URL+"/images/heart.png"} onClick = {onLikeClicked}></img>
        }
    }
    return(
        <div class= "pmodalcontent"  >
            <img src = {postcontent}></img>
            <div class = "postinfo">
                <div class = "person">
                    <img src = {profileimg}></img>
                    {
                        followbutton()
                    }
                </div>
                <div class = "commentsview">
                    <ul>
                        {
                            <li>{commentcard(profileimg,username, description, userid)}</li>
                        }
                        {
                            postcomments.map((comment)=>{
                                return <li>{commentcard(comment.img,comment.author,comment.description,comment.posterid)}</li>
                            })
                        }
                    </ul>
                </div>
                <div class = "extrafeatureview">
                    {
                    
                        DisplayHeartButton()
                    }
                    <span>{likeslist.length}</span>
                </div>
                <div class = "keyinComment">
                    <input id = "postcomment" type = "text" placeholder="Comment...">
                    </input>
                    <button type="button" class="btn btn-primary" onClick={onSubmitComment}>Submit</button>
                </div>
            </div>
        </div>
    )
}

function closepostcard(event){
    if(event.target.id == "modal"){
        $('.pmodal').css('display','none')
    }
}
class UserDetailsComponent extends React.Component{
        constructor(props){
            if(!localStorage.getItem("user")){
                this.props.navToLogin();
            }
            super(props);
            this.state={
                email:"",
                username:"",
                profileimg:"",
                posts:[],
                user:null,
                followers:[],
                following:[],
                comments:[],
                clickedimg:"",
                description:"",
                likes:[],
                description : ""
            }
            this.assignUser = this.assignUser.bind(this)
            this.assignPosts = this.assignPosts.bind(this)

        }

        componentDidMount(){
            $("#PostTab").css("border-top","1px solid black")
            getUserDetails(this.props.userid,this.assignUser,this.assignPosts)
        }

        assignUser(tmpuser){
            this.setState({
                user:tmpuser,
                username:tmpuser.username,
                profileimg:tmpuser.profileimage,
                posts:tmpuser.posts,
                email:tmpuser.email,
                followers:tmpuser.followers,
                clickedimg:"",
                following:tmpuser.following,
                description:tmpuser.description,
                
            })
        }

        assignPosts(res){
            this.setState({
                posts:res
            })
        }
        
        onClickedimg =(img,postid,allcomments,alllikes,description)=>{
            this.setState({clickedimg:img,clickedpostid:postid,comments:allcomments,likes:alllikes,description:description})
        }

        pushLikes = (postid,info)=>{
            var tmppost = this.state.posts;
            var currlikes = this.state.likes
            for(var i = 0 ;i<tmppost.length;i++){
                if(tmppost[i]._id == postid){
                    currlikes.push(info)
                    break;
                }
            }
            this.setState({
                likes:currlikes
            })
        }

        removeLikes = (postid,authorid)=>{
            var tmppost = this.state.posts;
            var likeslist = this.state.likes
            for(var i = 0 ;i<tmppost.length;i++){
                if(tmppost[i]._id == postid){
                    const likesret = likeslist.filter((element)=>element.authorid == authorid)
                    this.setState({
                        likes:likesret
                    })
                    break;
                }
            }
        }

        onInsertComment = (val,clickedpostid) =>{
            this.setState({comments:[...this.state.comments,val]})
            var allposts = this.state.posts
            for(var i = 0 ;i<allposts.length;i++){
                if(allposts[i]._id == clickedpostid){
                    allposts[i].comments.push(val);
                }
            }
        }

        setFollowers = (thisuser)=>{
            const res = this.state.followers.filter((element)=>element.author != thisuser._id);
            this.setState({
                followers:res
            })
        }

        setUnfollowers = (thisuser)=>{
            this.setState({
                followers:[...this.state.followers,{author:thisuser._id,name:thisuser.username,img:thisuser.profileimage}]
            })
        }
        useEditProfile =()=>{
            if(this.props.userid == JSON.parse(localStorage.getItem('user'))._id ){
                return EditProfile(this.state.email,this.state.description,this.onSetUserDescription);
            }else{
                const result = this.state.followers.filter((follower)=>follower.author == JSON.parse(localStorage.getItem('user'))._id)
                const thisuser = JSON.parse(localStorage.getItem("user"))
                const info = {
                        source:{id:thisuser._id,img:thisuser.profileimage,name:thisuser.username},
                        target:{id:this.props.userid,img:this.state.profileimg,name:this.state.username}
                }
                if(result.length > 0){
                    return <button type="button" class="btn btn-danger" onClick={()=>{Unfollowclicked(info,this.setFollowers)}}>Unfollow</button>
                }else{
                    return <button type="button" class="btn btn-primary" onClick={()=>{FollowClicked(info,this.setUnfollowers)}}>Follow</button>
                }
            }
        }

        onSetUserDescription =(newdescription)=>{
            this.setState({
                description:newdescription
            })
        }

       
        UpdateFollowing = (curruser)=>{
            
            this.setState({
                following:curruser.following
            })
        }

        ClickSave = ()=>{
            const user = JSON.parse( localStorage.getItem("user") )
            socket.emit("GetSaved",{authorid:this.props.userid}).on("EmitSaved",(res)=>{
                this.setState({
                    posts:res
                })
            })
            $("#SaveTab").css("border-top","1px solid black")
            $("#PostTab").css("border-top","none")
            $("#TagTab").css("border-top","none")
        }

        ClickPost = () =>{
            const user = JSON.parse(localStorage.getItem("user"))
            getUserDetails(this.props.userid,this.assignUser,this.assignPosts)
            $("#SaveTab").css("border-top","none")
            $("#PostTab").css("border-top","1px solid black")
            $("#TagTab").css("border-top","none")
        }

        SaveTabOption = () =>{
            const user = JSON.parse( localStorage.getItem("user") )
            if(user._id == this.props.userid){
                return (
                            <div class = "posttab" id = "SaveTab">
                                        <span id = "spanimg" onClick = {this.ClickSave} >
                                            <img src = {process.env.PUBLIC_URL+"/images/saved.png"} ></img>
                                        </span>
                                        <span onClick = {this.ClickSave}>SAVED</span>
                                </div>
                )
            }else{
                return <div></div>
            }
        }
              
        render(){

            return(
                <Fragment>
                    <div class ="userspage">
                        <div class = "userheader">
                            <div class = "profileimg">
                                <img src = {this.state.profileimg}></img>
                            </div>
                            <div class = "profileinfo">
                                <div class="profilename">
                                    <div class = "username">
                                        {
                                            
                                            this.state.username
                                        }
                                    </div>
                                    {
                                        this.useEditProfile()
                                    }
                                </div>
                                {
                                    CheckFollowers(this.state.posts,
                                                this.state.followers,
                                                this.state.following,
                                                this.props.openfunction,
                                                this.props.openid,
                                                this.props.openTitleFunction,
                                                this.props.openTitle,
                                                this.UpdateFollowing
                                                )
                                }
                                <div class="profileintro">
                                    {this.state.description}
                                </div>
                            </div>
                        </div>

                        <div class= "myimages">
                            <div class ="tabview">
                                <div class = "posttab" id = "PostTab" >
                                        <span id = "spanimg" onClick = {this.ClickPost}>
                                            <img src = {process.env.PUBLIC_URL+"/images/grid.png"}></img>
                                        </span>
                                        <span onClick={this.ClickPost}>POSTS</span>
                                </div>
                                {
                                    this.SaveTabOption()
                                }
                                <div class = "posttab" id = "TagTab">
                                        <span id = "spanimg">
                                            <img src = {process.env.PUBLIC_URL+"/images/tagged.png"}></img>
                                        </span>
                                        <span>TAGGED</span>
                                </div>
                            </div>
                        </div>

                        {
                            posts(this.state.posts,this.onClickedimg)
                            
                        }

                        <div class = "pmodal" id = "modal" onClick = {closepostcard} >
                            {
                                bigcard
                                    (   this.state.likes,
                                        this.state.clickedimg,
                                        this.state.comments == undefined ? [] : this.state.comments,
                                        this.props.userid,
                                        this.state.username,
                                        this.state.profileimg,
                                        this.state.clickedpostid,
                                        this.onInsertComment,
                                        this.props.navToUser,
                                        this.pushLikes,
                                        this.removeLikes,
                                        this.state.description
                                    )
                            }
                        </div>

                    </div>
                </Fragment>
            )   
    }

}


function UserDetails(){
    const { id } = useParams();
    console.log(id);
    const [openList, setIsOpened] = useState([]);
    const [openTitle, setOpenTitle] = useState("");
    const navigate = useNavigate();

    const navigateToLogin = () =>{
        navigate("/Login")
    }

    const navigateToUser = (id) =>{
        navigate('users/'+id);
    }
    return (
        <div>
            <UserDetailsComponent navToUser = {navigateToUser} navToLogin = {navigateToLogin} userid={id} openfunction = {setIsOpened} openid={openList} openTitleFunction = {setOpenTitle} openTitle = {openTitle} ></UserDetailsComponent>
        </div>
    )
}

export default UserDetails;