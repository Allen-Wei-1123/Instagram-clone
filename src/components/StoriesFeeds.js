import React,{Fragment} from 'react'
import '../styles/stories.css'
import $ from 'jquery'

function InputClicked(){
    $(".GrayBackground").css("display",'block')
    $(".ReplyCommentBox input").css('z-index','2')
}

function CloseModal(e){
    if(e.target.className == "storiesmodal"){
        $(".storiesmodal").css("display",'none')
    }
}

function CloseGrayBackground(e){
    if(e.target.className == "GrayBackground"){
        $(".GrayBackground").css("display","none")
    }
}

function SingleStory(isSelected){

    function SwapContent(){
        if(isSelected){
            return isSelectedDiv()
        }else{
            return NotSelectedDiv()
        }
    }
    function isSelectedDiv() {
        return (
            <div class = "storiesmodalcontentSelected">
                <div class = "UpperItems">
                    <img src = {process.env.PUBLIC_URL+"/images/kobe.jpeg"}></img>
                    <div class= "itemusername">Kobe Bryant</div>
                </div>
                <img src = {process.env.PUBLIC_URL+"/images/markzuck1.jpeg"}></img>

                <div class = "ReplyandLike">
                    <div class = "ReplyCommentBox">
                        <input type = "text" placeholder="Reply to me..." onClick={InputClicked}></input>
                    </div>
                </div>

                <div className = "GrayBackground" onClick={CloseGrayBackground}>

                </div>
            </div>
        )
    }

    function NotSelectedDiv(){
        return(
            <div class = "storiesmodalcontentNotSelected" >
                <div class = "UpperItems">
                    <img src = {process.env.PUBLIC_URL+"/images/kobe.jpeg"}></img>
                    <div class= "itemusername">Kobe Bryant</div>
                </div>
                <img src = {process.env.PUBLIC_URL+"/images/markzuck1.jpeg"}></img>
                <div class = "overlay">

                </div>
            </div>
        )
    }

    return (
        SwapContent()
    )
}

class StoriesFeeds extends React.Component{
    constructor(props){
        super(props);
        this.state={

        }
    }
    render(){
        return(
            <Fragment>
                <div className = "storiesmodal" onClick={CloseModal}>
                   {
                       SingleStory(true)
                   }
                  
                </div>
            </Fragment>
        )
    }
}

export default function StoriesFeedComponents(){
    return <StoriesFeeds></StoriesFeeds>
}