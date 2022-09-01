import io from "socket.io-client"

const socket = io("http://localhost:5000")

function FollowClicked(detail,setLoginUserfunction){
    socket.emit("followclicked",detail);
    var curruser = JSON.parse(localStorage.getItem("user"))
    curruser.following.push({author:detail.target.id,img : detail.target.img, name:detail.target.name })
    localStorage.setItem("user",JSON.stringify(curruser))
    setLoginUserfunction((curruser));
}


function Unfollowclicked(detail,setLoginUserfunction){
    socket.emit("unfollowclicked",detail)
    var curruser = JSON.parse(localStorage.getItem("user"))
    const res = curruser.following.filter((element)=>element.author != detail.target.id);
    curruser.following = res;
    localStorage.setItem("user",JSON.stringify(curruser));
    setLoginUserfunction((curruser));
}

export {FollowClicked, Unfollowclicked};