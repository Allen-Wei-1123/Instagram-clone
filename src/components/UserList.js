import render from 'dom-serializer'
import React from 'react'
import '../styles/userlist.css'
import { FollowClicked,Unfollowclicked } from './FollowButtons'

class UserList extends React.Component{

    constructor(props){
        super(props)

    }


    Displaybutton =(targetid,targetname,targetimg)=>{
        var user = JSON.parse(localStorage.getItem("user"))
        const res = user.following.filter((src)=>src.author == targetid)
        const info = {source:{id:user._id,name:user.username,img:user.profileimage},target:{id:targetid,name:targetname,img:targetimg}}
        if(user._id == targetid){
            return <div></div>
        }
        if(res.length > 0){
            return <button type ="button" class = "btn btn-danger" onClick = {()=>{Unfollowclicked(info,this.props.UpdateFollowingfunction)}} >Unfollow</button>
        }else{
            return <button type ="button" class = "btn btn-primary" onClick = {()=>{FollowClicked(info,this.props.UpdateFollowingfunction)}}>Follows</button>
        }
    }
    
    render(){
        return(
            <div>
                {
                    this.props.listitems.map((follower)=>{
                        return <div class = "userlist">
                           <img src={follower.img}></img>
                           <div class = "userlistname">{follower.name}</div>
                           {
                               this.Displaybutton(follower.author,follower.name,follower.img)
                           }
                       </div>
                   })
                }
            </div>
        )
    }
}

export default UserList;