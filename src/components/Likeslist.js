import React , {Component,Fragment} from 'react'
import '../styles/likeslist.css'
import $ from 'jquery'
import { useNavigate } from 'react-router'

import { FollowClicked,Unfollowclicked } from './FollowButtons'

function followbutton(itemid,itemname,itemimg,setLoginUserfunction,followinglist){
    const user = JSON.parse(localStorage.getItem("user"))
    if(user._id == itemid){
        return  <div></div>
    }else if (!user.following.find((element)=>element.author == itemid)){
        const info = {source:{id:user._id,name:user.username,img:user.profileimage},target:{id:itemid,name:itemname,img:itemimg}}
        return <button type="button" class="btn btn-primary" onClick={()=>{FollowClicked(info,setLoginUserfunction)}}>Follow</button>
    }else{
        const info = {source:{id:user._id,name:user.username,img:user.profileimage},target:{id:itemid,name:itemname,img:itemimg}}

        return <button type="button" class="btn btn-danger" onClick={()=>{Unfollowclicked(info,setLoginUserfunction)}}>Unfollow</button>
    }
}


function Listitems(item,setloginuserfunction,followinglist){
    
    return(
        <div class = "likeview">
            <img src = {item.profileimage}></img>
            <span>{item.name}</span>
            {followbutton(item.authorid,item.name,item.profileimage,setloginuserfunction,followinglist)}
        </div>
    )
}
class Likeslist extends Component{
    constructor(props){
        super(props)
    }

    closeModal = (e) =>{
        if(e.target.id == "modal"){
            $("#modal").css('display','none')
        }
    }

    render(){

    return (
        <div class ="fmodal" id = "modal" onClick={this.closeModal}>
                <div class = "modalcontent">
                    <h3>{this.props.title}</h3>
                    <ul class="list-group">
                        {
                        
                        this.props.listarr.map((element)=>{
                           return  <li class = "list-group-item">
                                {
                                    Listitems(element,this.props.setloginuserfunction,this.props.followinglist)
                                }
                            </li>
                        })
                        }
                    </ul>
                </div>
        </div>
    )
}

}



export default Likeslist;
