const { default: axios } = require("axios");
const { printAction } = require("./telegramHelpers");
const fs = require("fs");
const { userManagementPipeline } = require("./groupUserManagement");
const { mainConversationPipeline } = require("./conversationPipeline");
const botToken = process.env.BOTTOKEN;
let lastUpdate = "";
let users = {};
let timeSheet = {};
const { loadTimeSheet } = require("./alfredHelpers");
const SlotBot = require('./slotbot');

const { getSheetsHandler, getSheetContent } = require("./sheetsWrapper");

function poller() {
  axios
    .get(
      `https://api.telegram.org/bot${botToken}/getUpdates?limit=10${lastUpdate != "" ? "&offset=" + lastUpdate : ""
      }`
    )
    .then((response) => {
      if (response.data.result.length === 0) {
        return;
      }
      lastUpdate =
        response.data.result[response.data.result.length - 1].update_id;
      response.data.result.slice(1).forEach((responseUpdate) => {
        processUpdate(responseUpdate);
      });
    })
    .catch((e) => {
      console.log("e:", e);
    });
}

function inferAction(update) {
  let base = { updateId: update.update_id };
  if (update["my_chat_member"]) {
    let by = update["my_chat_member"].from;
    let group = update["my_chat_member"].chat;
    let time = update["my_chat_member"].date;
    base = { ...base, by, group, time };
    let fromState = update["my_chat_member"].old_chat_member;
    let toState = update["my_chat_member"].new_chat_member;
    if (fromState.user.id === toState.user.id) {
      let user = fromState.user;
      if (fromState.status !== toState.status) {
        return {
          type: "user_promoted",
          ...base,
          user,
        };
      } else {
        return {
          type: "unknown_user_update",
          ...base,
          fromState,
          toState,
        };
      }
    }
    return {
      type: "unknown_different_user_update",
      ...base,
      fromState,
      toState,
    };
  } else if (update["message"]) {
    let by = update["message"].from;
    let group = update["message"].chat;
    let time = update["message"].date;
    base = { ...base, by, group, time };
    if (update["message"].new_chat_member) {
      if (update["message"].new_chat_member.id === by.id) {
        return {
          type: "new_user_joined",
          ...base,
          user: update["message"].new_chat_member,
        };
      }
    }
    if (update["message"].new_chat_members) {
      return {
        type: "new_users_added",
        ...base,
        users: update["message"].new_chat_members,
      };
    }
    if (update["message"].pinned_message) {
      return {
        type: "pinned_message",
        ...base,
        pinned: update["message"].pinned_message,
      };
    }
    if (update["message"].photo) {
      return {
        type: "photo",
        ...base,
        photo: update["message"].photo,
      };
    }
    if (update["message"].text) {
      base = { ...base, text: update["message"].text };
      return {
        type: "message",
        ...base,
      };
    }
    return {
      type: "unknown_message",
      ...base,
      message: update["message"],
    };
  }
  return { type: "unknown", update };
}




function processUpdate(update) {
  let action = inferAction(update);
  userManagementPipeline(action, users, timeSheet);
  mainConversationPipeline(action, users, timeSheet);
  printAction(action);
}

function loadData(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (e, readData) => {
      if (e) {
        console.log(e.message);
        reject(false);
        return;
      }
      resolve(JSON.parse(readData));
    });
  });
}

function syncCache(){
  console.log("Writing cache");
  fs.writeFile("users.json",JSON.stringify(users),(err)=>{
    if(err){
      console.log(err);
    }
  });
  fs.writeFile("timesheet.json",JSON.stringify(timeSheet),(err)=>{
    if(err){
      console.log(err);
    }
  })
}

function startUp() {
  console.log("Alfred here. My token is", botToken);
  Promise.all([
    loadData("users.json").catch(() => {}),
    loadData("timesheet.json").catch(() => {}),
  ]).then((usersRead, timeSheetRead) => {
    users = usersRead ? usersRead : {};
    timeSheet = timeSheetRead ? usersRead : {};
    console.log("Loaded users and timesheet");
    setInterval(()=>{
      syncCache()
    },10000);
    setInterval(() => {
      poller();
    }, 2000);
        
    /**
     * Hey Raman, can we use the timesheet from json for comparison?
     * The loadTimeSheet wont be needed since the timesheet json would be the source of data
     * We can use the loadTimeSheet function for now, for the dummy data
     * We'll use the sheets api for updating the cells
     */
    loadTimeSheet().then((timeSheet) => {
      new SlotBot(timeSheet).startBot();
    }).catch(err => {
      console.log(err);
    });


  });
}

startUp();
