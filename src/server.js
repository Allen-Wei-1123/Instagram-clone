const { profile } = require('console');
const express = require('express')
const app = express()
app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","Origin, X-Requested-Width,Content-Type,Accept");
    next();
});

const uri =
  "mongodb+srv://allen:node123@cluster0.ahteng1.mongodb.net/?retryWrites=true&w=majority";
const { MongoClient, ObjectID, ObjectId } = require("mongodb");
const client = new MongoClient(uri);

var collection;
const server = require('http').Server(app)
    .listen(5000,async ()=>{
    console.log('open server!')

    await client.connect();
          collection = client.db("Instagram").collection("users");
})

const io = require('socket.io')(server,{
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials:true
      }
})



io.on('connection', socket => {
    socket.on('login', async(message) => {
            collection = client.db("Instagram").collection("users")
            console.log("message is ",message)
            await collection.find({email:message.email  , password:message.password }).toArray(async (err,res)=>{
            socket.emit('loginResult',res, (err,response)=>{
               if(err){
                 throw err;
               }
            });
          });
    })

    socket.on("register", async (message) => {
        collection = client.db("Instagram").collection("users")
         await collection.insertOne({email:message.email,profileimage:message.profileimg,username:message.username,password:message.password,posts:[],following:[],followers:[],stories:[]},(err,res)=>{
           socket.emit('returnID',message);
         })
    });

    socket.on('postimage',async(post)=>{
        console.log("post is ",post);

        collection = client.db("Instagram").collection("Posts")
        if(!post.storiesEnable){
            await collection.insertOne({author:post.author,img:post.img,description:post.description,time:post.time,likes:[]},async(err,res)=>{
                await client.db("Instagram").collection("users").updateOne({_id:ObjectId(post.posterid)},{$push:{posts:res.insertedId}})
            })
        }else{
            await client.db("Instagram").collection("Stories").insertOne({author:post.author,img:post.img,time:post.time,likes:[]},async(err,res)=>{
                console.log("res is ",res, post.posterid);
                await client.db("Instagram").collection("users").updateOne({_id:ObjectId(post.posterid)},{$push:{stories:res.insertedId}})
            })
        }
        
    })

    socket.on("getusers",async ()=>{
        collection  = client.db("Instagram").collection("users")
        await collection.find().toArray(async(err,res)=>{
             socket.emit("returnallusers",res)
        })
    })

    socket.on("finduser",async(detail)=>{
        collection = client.db("Instagram").collection("users");
        await collection.findOne({_id:ObjectId(detail.id)},async(err,res)=>{
            await socket.emit("getUserDetail",res)
            var returnPosts=[]
            if(res.posts != undefined){
                for(var i = 0 ;i<res.posts.length;i++){
                    await client.db("Instagram").collection("Posts").findOne({_id:res.posts[i]}).then(postres=>{
                        returnPosts.push(postres);
                    })
                }
                socket.emit("getUserPosts",returnPosts);
            }else{
                socket.emit("getUserPosts",[]);
            }
            
        })
    })

    socket.on("insertcomment",async(detail)=>{
        collection = client.db("Instagram").collection("Posts");
        try{
            await collection.updateOne({_id:ObjectId(detail.postid)},{$push:{comments:{author:detail.posterusername,
                description:detail.description,
                time:detail.time,
                img:detail.img,
                posterid : detail.posterid
            }}}).then(value=>{
                socket.emit("returncomments",value);
            })
        }catch(err){
            console.log(err);
            throw err; 
        }
        
    })

    socket.on("followclicked",async(detail)=>{
        collection = client.db("Instagram").collection("users")
        await collection.updateOne({_id:ObjectId(detail.source.id)},{$push:{following:{author:detail.target.id,name:detail.target.name,img:detail.target.img}}})
        await collection.updateOne({_id:ObjectId(detail.target.id)},{$push:{followers:{author:detail.source.id,name:detail.source.name,img:detail.source.img}}})
    })


    socket.on("unfollowclicked",async(detail)=>{
        collection = client.db("Instagram").collection("users")
        console.log("detail is ",detail);
        await collection.updateOne({_id:ObjectId(detail.target.id)},{$pull:{followers:{author:detail.source.id}}})
        await collection.updateOne({_id:ObjectId(detail.source.id)},{$pull:{following:{author:detail.target.id}}} , {new:true}, (err,doc)=>{
        } )
    })

    socket.on("GetHomeFeeds",async(detail)=>{
        collection = client.db("Instagram").collection("users")
        var ret = []
        var Storiesret = [] 
        if(detail == null) return ;
        const promises = []
        for(var i = 0 ;i<detail.length;i++){
           promises.push( 
                await collection.findOne({_id:ObjectId(detail[i].author)}).then(async(res)=>{
                const name = detail[i].name;
                const profileimg = detail[i].img;
                const retauthorid = detail[i].author;
                for(var j = 0 ;j<res.posts.length;j++){
                    await client.db("Instagram").collection("Posts").findOne({_id:ObjectId(res.posts[j])})
                    .then((retPost)=>{
                        ret.push({retPost:retPost,author:name,profileimage:profileimg,authorid:retauthorid})
                    })
                }
                const stories = res.stories; 
                for(var j = 0 ;j<stories.length;j++){
                    await client.db("Instagram").collection("Stories").findOne({_id:ObjectId(stories[j])})
                            .then((retPost)=>{
                                Storiesret.push({retPost:retPost,author:name,profileimage:profileimg,authorid:retauthorid})
                            })
                }
            }))

        }

        Promise.all(promises).then(()=>{
            socket.emit("ReturnHomeFeeds",ret);
            socket.emit("ReturnStoriesFeed",Storiesret)
        })
    })

    socket.on("UpdateDescription",async(detail)=>{
        collection = client.db("Instagram").collection("users")
        collection.updateOne({email:(detail.email)},{$set: {description:detail.description}})
    })
    

    socket.on("onLikeClicked",async(detail)=>{
        collection = client.db("Instagram").collection("Posts")
        const info = {authorid:detail.authorid,name:detail.name,profileimage:detail.profileimage}
        console.log("likes info ",info)
        collection.updateOne({_id:ObjectId(detail.postid)},{$push:{likes:info}})
    })

    socket.on("Unlikeclicked",async(detail)=>{
        collection = client.db("Instagram").collection("Posts")
        collection.updateOne({_id:ObjectId(detail.postid)},{$pull:{'likes':{authorid:detail.authorid}}})
    })


})