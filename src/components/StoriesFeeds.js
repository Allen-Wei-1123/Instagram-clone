import React,{Fragment} from 'react'
import '../styles/stories.css'
class StoriesFeeds extends React.Component{
    render(){
        return(
            <Fragment>
                <div class = "storiesmodal">
                    <div class = "storiesmodalcontent">
                        <div class = "UpperItems">

                        </div>
                    {/* <img src = {process.env.PUBLIC_URL+"/images/markzuck1.jpeg"}></img> */}

                        <div class = "ReplyandLike">
                            <div class = "ReplyCommentBox">
                                <input type = "text" placeholder="Reply to me..."></input>
                            </div>
                        </div>
                    </div>
                </div>
            </Fragment>
        )
    }
}

export default function StoriesFeedComponents(){
    return <StoriesFeeds></StoriesFeeds>
}