var DBProcess ={
  action(data_req){
    var data = Meens.meensBaseDe(data_req);
    var meensdata = JSON.parse(data);
    if(meensdata.tokdou){
      return DBProcess.tokdou(meensdata);
    }else if(meensdata.chat){
      return DBProcess.chat(meensdata.chat);
    }else if(meensdata.delete){
      return DBProcess.delete(meensdata.delete);
    }else if(meensdata.update){
      return DBProcess.update(meensdata.update);
    }else if(meensdata.getmain){
      return DBProcess.getmain((meensdata.getmain.collection).toString(), parseInt(meensdata.getmain.start), parseInt(meensdata.getmain.end));
    }else if(meensdata.getdata){
      return DBProcess.getdata((meensdata.getdata.collection).toString(), meensdata.getdata.id);
    }else{
      return false;
    }
  },
  chat(data){
    return data;
  },
  tokdou(meensdata){ 
    try{ 
      //{type=tiktok, url=true}
      var check = Utils.checkurl((meensdata.tokdou).toString());
      if(check.type != false && check.url == true)
      {  
        var data = MeensAction.gettokdou((meensdata.tokdou).toString());
        if(data.msg == "success"){
          var times = Math.round(new Date().getTime()/1000);
          //var id_post = Meens.meensBaseEn(times);
          var data_user_post = {
            id: data.data.author.id,
            uid: data.data.author.id,
            unique_id : data.data.author.unique_id,
            nickname: data.data.author.nickname,
            avatar: data.data.author.avatar,
            region: data.data.region,
            times: (times).toString()
          }

          var data_video_post ={
            id: data.data.id,
            author: data.data.author.id,
            times: (times).toString()
          }

          var cap = "";
          if(data.data.title!= ""){
            cap+= "\n🐶: "+ data.data.title;
          }
          
          cap+= "\n🎬: "+ data.data.id;
          cap+= "\n😜: "+ data.data.author.unique_id;
          cap+= "\n😍: "+ data.data.author.nickname;
          cap+= "\n🌎: "+ data.data.region;
          
          var link_res = false;

          if(meensdata.local == "true"){
            link_res = data.data.play;            
          }else{ 

            if(check.type == "douyin"){
              //add database user
              var vidcheck = DBProcess.getdata("DouVid",data.data.id);              
              if(vidcheck == false){
                Firestore.update("DouUser",data.data.id,data_video_post);
                BOT.telegram.sendDocument(OWNERCHANNELDOU,data.data.play,{caption: cap});
              } 
            }

            if(check.type == "tiktok"){
              //add database user
              var vidcheck = DBProcess.getdata("TokVid",data.data.id);              
              if(vidcheck == false){
                Firestore.update("TokVid",data.data.id,data_video_post);
                BOT.telegram.sendDocument(OWNERCHANNELTOK,data.data.play,{caption: cap});
              } 
              
            }

          }

          if(meensdata.adduser == "true"){
            if(check.type == "douyin"){
              //add database user
              Firestore.update("DouUser",data.data.author.id,data_user_post);
            }

            if(check.type == "tiktok"){
              //add database user
              Firestore.update("TokUser",data.data.author.id,data_user_post);
            }
            
          }

        }else{
          var times = Math.round(new Date().getTime()/1000);
          var id_post = Meens.meensBaseEn(times);      
          var data_post = {
            id: id_post,
            text: (meensdata.tokdou).toString(),
            times: times
          }
          Firestore.update("TokDouLoi", id_post ,data_post);
          var data_res ={
            link : false,
            type : false,
            action: "error",
          }
          return data_res;       
        }

      }else{ //if url and type

          var data_res ={
            link : false,
            type : false,
            action: "error",
          }
          return data_res; 
      }


    }catch(e){

        var data_res ={
          link : false,
          type : false,
          action: "error",
        }
        return data_res; 
    }

    
  },
  delete(data_req)
  {
      /***
       $post_data =[
              "token" =>"",
              "delete"=>[
                  "sheetdb" => "123",
                  "colection"=>"linkdata",
                  "data" => [
                      "id" =>"123"
                  ],
              ],
      ];
      */
    return Firestore.delete((data_req.collection).toString(),data_req.data.id);
  },
  update(data_req) // update and insert
  {
      /***
       $post_data =[
              "token" =>"",
              "update"=>[
                  "sheetdb" => "123",
                  "colection"=>"linkdata",
                  "data" => [
                      "id" =>"123",
                      "name" =>"12321321"
                  ],
              ],
      ];
      */
    return Firestore.update((data_req.collection).toString(),data_req.data.id,data_req.data);
  },
  getmain(collection,start,end)
  {
    try{
      var firestore = Firestore.databse();
      var docs = firestore.query(collection)
          .Select("id")
          .Select("title")
          .Select("type")          
          .Select("meens")
          .Select("status")
          .Select("nickname")
          .Select("avatar")
          .Range(start,end)
          .OrderBy('times', 'desc')
          .Execute();
      var data = [];
      var num = 0;
      Object.entries(docs).forEach(([key,value]) => {
        data[num] = value.obj;
        num = num+1;
      });
      return data;
    }catch(e){
      return false;
    }
  },
  getdata(collection,doc_id)
  {
    try{
      return Firestore.getDocument(collection,doc_id);
    }catch(e){
      return false;
    }
  }

};
