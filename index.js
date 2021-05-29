const { default: axios } = require("axios");
const {printAction}  = require("./telegramHelpers");
const {userManagementPipeline} = require("./groupUserManagement")
const botToken = "bot1811641838:AAFCSJ1pwac3EczAY63-dPdbwpl0RcgzWeI";
let lastUpdate = "";
let users={};
let timeSheet = {};

function poller() {
  axios
    .get(
      `https://api.telegram.org/${botToken}/getUpdates?limit=10${
        lastUpdate != "" ? "&offset=" + lastUpdate : ""
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
    if(update["message"].new_chat_member){
      if(update["message"].new_chat_member.id === by.id){
        return {
          type: "new_user_joined",
          ...base,
          user: update["message"].new_chat_member,
        }
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
  userManagementPipeline(action,users,timeSheet);
  printAction(action);
}

setInterval(() => {
  poller();
}, 2000);

