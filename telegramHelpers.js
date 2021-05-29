const botAccessToken = process.env.bottoken;

function processGroupAction(group,user,decision)
{
    switch(decision){
        case "safe":return;
        case "kick":console.log("User needs to be kicked.");
        default:console.log("What do you mean by "+decision);
    }
}
function getUserName(){
    return `${user.first_name} ${user.last_name}`;
}

function getGroupText(group) {
    return `${group.title}(@${group.username ? group.username : "private"}|${group.id})`;
  }
  function getUserText(user) {
    return `${user.first_name}(${user.id})`;
  }


function sendMessage(chatId,message){
    console.log("[TELEGRAM] "+message);
    return axios
      .get(
        `https://api.telegram.org/bot${botAccessToken}/sendMessage?chat_id=${chatId}&parse_mode=html&text=${message}&disable_notification=true`
      )
      .then((response) => {
        console.log(
          "[TELEGRAM] Successfully sent message to channel at ",
          new Date().toString()
        );
      })
      .catch((err) => {
        console.log("[TELEGRAM] Error : ", err);
      });
}


function printAction(action) {
    let log = ``;
    switch (action.type) {
      case "user_promoted":
        log = `${getUserText(action.user)} was promoted`;
        break;
      case "unknown_user_update":
        log = `Unknown User Update. ${JSON.stringify(action)}`;
        break;
      case "unknown_different_user_update":
        log = `Unknown User Update. ${JSON.stringify(action)}`;
        break;
      case "new_user_joined":
          log = `[${getGroupText(action.group)}] ${getUserText(
            action.by
          )} joined`;
          break;
      case "new_users_added":
        log = `[${getGroupText(action.group)}] ${getUserText(
          action.by
        )} added ${action.users.map(getUserText).join(", ")}`;
        break;
      case "message":
        log = `[${getGroupText(action.group)}] ${getUserText(action.by)} : ${
          action.text
        }`;
        break;
      case "unknown_message":
        break;
      case "pinned_message":
      case "photo":
        break;
      default:
        log = "";
        break;
    }
    if (log !== ``) {
      console.log(`[${action.time}] ${log}`);
    }
  }

module.exports={
    processGroupAction,
    sendMessage,
    getUserName,
    printAction
}