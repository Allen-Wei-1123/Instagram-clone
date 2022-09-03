import React,{Component,Fragment} from 'react'
import { useNavigate } from 'react-router'
import '../styles/home.css'
import io from "socket.io-client"
import $ from 'jquery'
import Likeslist from './Likeslist'
import StoriesFeedComponents from './StoriesFeeds'
const socket = io("http://localhost:5000")


function feedsview( removeLikefunction,
                    ClickedPostid,
                    insertLikesfunction,
                    navToUserfunction,
                    pushcommentfunction,
                    posterimg,
                    postername,
                    postimg,
                    commentsarr,
                    thispostid,authorid,likesarr,postdescription,
                    insertSave,
                    removeSave,
                    SavedPostList
                    ){

    function comments(name,img,description,posterid){
        return (
                <Fragment>
                <img src = {img}></img>
                <div class = "selfcomment">
                    <span onClick={()=>{navToUserfunction(posterid)}}>{name}</span>&nbsp;&nbsp;{description}
                </div>
                </Fragment>
        )
    }

    function submitComments(){
        const user = JSON.parse(localStorage.getItem("user"))
        const info = {postid:thispostid,
                    posterusername:user.username,
                    description:$("#commentinput"+thispostid).val(),
                    img:user.profileimage,
                    time : Date().toLocaleString(),
                    posterid : user._id
                }
        socket.emit("insertcomment",info)
        pushcommentfunction(thispostid,{author:user.username,description:info.description,img:user.profileimage,time:info.time,posterid:user._id});
        $("#commentinput"+thispostid).val("")

    }

    function nameOnClick (id){
        navToUserfunction(id);
    }

    function onLikeClicked(){
        const user = JSON.parse(localStorage.getItem("user"))
        const info = {postid:thispostid,authorid:user._id,name:user.username,profileimage:user.profileimage}
        socket.emit("onLikeClicked",info)
        insertLikesfunction(thispostid,info);
    }

    function onUnlikeClicked(){
        const user = JSON.parse(localStorage.getItem("user"))
        const info = {postid:thispostid,authorid:user._id}
        socket.emit("Unlikeclicked",info)
        removeLikefunction(thispostid);
    }

    function heartButton(){
        const user = JSON.parse(localStorage.getItem("user"))
        if(!likesarr.find(element=> element.authorid == user._id)){
            return <img src = {process.env.PUBLIC_URL+"/images/heart.png"  }  onClick ={onLikeClicked}></img>
        }else{
            return <img src = {process.env.PUBLIC_URL+"/images/redheart.png"} onClick={onUnlikeClicked}></img>
        }
    }

    function clickOpenLikes(){
        $(".fmodal").css('display','block')
        ClickedPostid(thispostid)
    }

   function retComments(){
       if(commentsarr != undefined){
           console.log("comments are ",commentsarr)
            return commentsarr.map((comment)=>{
                return <li> {comments(comment.author,comment.img,comment.description,comment.posterid)}</li>
            })
       }else{
           console.log("comments are undefined")
           return <div></div>
       }
    
   }


   function ClickSave(){
        const user = JSON.parse(localStorage.getItem("user"))
        const detail = {authorid:user._id,postid:thispostid}
        socket.emit("SaveClicked",detail)
        insertSave(detail.postid)
   }

   function RemoveSave(){
       const user = JSON.parse(localStorage.getItem("user"))
       const detail = {authorid:user._id,postid:thispostid}
       socket.emit("RemoveSave",detail)
       removeSave(detail.postid)
   }



   function SaveButton(){
    //    console.log("thispostid is ",thispostid , SavedPostList)
        if( !(SavedPostList.includes(thispostid)) ){
            return  <img src ={process.env.PUBLIC_URL+"/images/save.png"} onClick={ClickSave} id = "saveicon"></img>
        }else{
            return <img src ={process.env.PUBLIC_URL+"/images/bookmark.png"} onClick={RemoveSave} id = "saveicon"></img>
        }
   }

    return(
        <Fragment>
            <div class = "feedsview">
                <div class = "postperson">
                    <img src = {posterimg}></img>
                    <div class="name" onClick={()=>{nameOnClick(authorid)}}>
                        {postername}
                    </div>
                </div>
                <div class = "feedimg">
                    <img src = {postimg}></img>
                </div>
                <div class = "featuresview">
                    {heartButton()}
                    <img src = {process.env.PUBLIC_URL+"/images/message.png"}></img>
                    <img src = {process.env.PUBLIC_URL+"/images/send.png"}></img>
                    {SaveButton()}
                </div>
                <div class = "likesview">
                    <span onClick={clickOpenLikes}>{likesarr.length} Like</span>
                </div>
                <div class = "postcomments">
                    <ul >
                        <li>
                            {
                                comments(postername,posterimg,postdescription,authorid)
                            }
                        </li>
                        {
                            retComments()
                        }
                    </ul>
                </div>
                <div class = "entercomment">
                    <input type = "input" id = {"commentinput"+thispostid} placeholder = "Enter..."></input>  
                    <button type="button" class="btn btn-primary" onClick={submitComments}>Post</button>        
                </div>
            </div>
        </Fragment>
    )
}

function StoriesView(stories){
    function clickStories(){
        $(".storiesmodal").css("display","flex")
        $(".storiesmodal").css("justify-content","center")
        $(".storiesmodal").css("align-items","center")
    }
    

    return (
        Object.keys(stories).forEach((key,index)=>{
            const userval = stories[key][0];
            console.log("userval is ",userval);
            return  <img src = {userval.profileimage} onClick={clickStories}></img>
        })
    )
}


class Home extends  React.Component{
    constructor(props){
        super(props);
        this.state=({
            loginuser:{},
            users:[],
            posts:[],
            likelist:[],
            stories:[],
            clickedstories:[],
            saved:[]
        })
    }
    componentDidMount(){
        if(!localStorage.getItem("user")){
            this.props.navToLogin();
        }
        const user = JSON.parse(localStorage.getItem("user"))
        this.setState({loginuser:user})
        console.log("following is ",user.following)
        socket.emit("GetHomeFeeds",user.following).on("ReturnHomeFeeds",res=>{
            this.setState({
                posts:res,
                loginuser:user
            })
        })
        .on("ReturnStoriesFeed",(res)=>{
            console.log("res is ",res);
            var tmpstate = {}
            for(var i = 0 ;i<res.length;i++){
                if(!(res[i].authorid in tmpstate)){
                    tmpstate[res[i].authorid] = []
                }
                tmpstate[res[i].authorid].push(res[i])
            }
            this.setState({
                stories:tmpstate
            })
        })


    }

    setLoginUser = (user)=>{
        console.log("user is ",user);
        this.setState({loginuser:user})
    }

    pushComments = (postid,comment)=>{
        var currpost = this.state.posts;
        for(var i = 0;i<currpost.length;i++){
            if(currpost[i].retPost._id == postid){
                currpost[i].retPost.comments.push(comment);
                break;
            }
        }
        this.setState({posts:currpost})
    }

    insertLikes = (postid,info) =>{
        var currpost = this.state.posts;
        for(var i = 0;i<currpost.length;i++){
            if(currpost[i].retPost._id == postid){
                currpost[i].retPost.likes.push(info);
                break;
            }
        }
        this.setState({posts:currpost})
    }

    removeLike = (postid)=>{
        const user = JSON.parse(localStorage.getItem("user"))
        var currpost = this.state.posts;
        for(var i = 0 ;i<currpost.length;i++){
            if(currpost[i].retPost._id == postid){
                const res = currpost[i].retPost.likes.filter((element)=>element.authorid != user._id)
                currpost[i].retPost.likes = res;
                this.setState({posts:currpost})
                break;
            }
        }
    }

    ClickedPostid = (postid) =>{
        const thispost = this.state.posts;
        for(var i  = 0 ;i<thispost.length;i++){
            if(thispost[i].retPost._id == postid){
                this.setState({
                    likelist:thispost[i].retPost.likes
                })
            }
        }
    }

    insertSave = (postid) =>{
        var curruser = this.state.loginuser;
        curruser.saved.push(postid);
        this.setState({loginuser:curruser})
        localStorage.setItem("user",JSON.stringify(curruser))
    }

    removeSave = (postid) =>{
        var curruser = this.state.loginuser;
        const res = curruser.saved.filter((element)=>element != postid);
        curruser.saved = res;
        this.setState({loginuser:curruser})
        localStorage.setItem("user",JSON.stringify(curruser))
    }


    render(){
        return (
            <Fragment>
                <div class= "homeview">
                    <div class ="storyitems">
                        <ul>
                            {
                                StoriesView(this.state.stories)
                            }
                        </ul>
                    </div>
                    <div class = "verticalPostView">
                        <ul id = "feedsul">
                            {
                            this.state.posts.map((post)=>{
                                return <li id = "postli">
                                    {
                                        feedsview(  this.removeLike,
                                                    this.ClickedPostid,
                                                    this.insertLikes,
                                                    this.props.navToUser,
                                                    this.pushComments , 
                                                    post.profileimage,
                                                    post.retPost.author,
                                                    post.retPost.img,
                                                    post.retPost.comments == undefined ? undefined :post.retPost.comments,
                                                    post.retPost._id,
                                                    post.authorid,post.retPost.likes,post.retPost.description,
                                                    this.insertSave,
                                                    this.removeSave,
                                                    this.state.loginuser.saved
                                                )
                                    }
                                </li>
                            })
                            }
                        </ul>
                    </div>
                </div>
                <Likeslist listarr  = {this.state.likelist} followinglist = {this.state.loginuser.following} title={"Likes"} setloginuserfunction = {this.setLoginUser}></Likeslist>
                <StoriesFeedComponents ></StoriesFeedComponents>
                        
            </Fragment>
        )
    }
}

function HomeComponent(){
    const navigate = useNavigate();
    const navigateToLogin = () =>{
        navigate('/Login')
    }

    const navigateToUser= (id)=>{
        navigate('/users/'+id)
    }
    return (
        <Home navToLogin = {navigateToLogin} navToUser ={navigateToUser}></Home>
    )
}

// export default Home;
export default HomeComponent;