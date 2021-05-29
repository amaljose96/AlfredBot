const { informTheAdmins, getUserName } = require("./alfredHelpers");
const { processGroupAction, sendMessage } = require("./telegramHelpers");
const { updatesGroup } = require("./constants");

/**
 * This module checks every user update in the group
 * 1. If new user is added -> check if name in user details CSV or time sheet else kick
 */

function checkIfNewUserWasAdded(action) {
  return action.type === "new_users_added" && action.group.id === updatesGroup;
}

function handleNewUserAdd(action, users, timesheet) {
  let { addedUsers, group } = action;
  addedUsers.forEach((addedUser) => {
    //Check if user is in users list. If not
    if (!users[addedUser.id]) {
      informTheAdmins(
        getUserName(addedUser) + " was kicked for not choosing timeslot"
      );
      processGroupAction(group, addedUser, "kick");
    }
  });
}

function groupUserManagementPipeline(action, users, timesheet) {
  if (checkIfNewUserWasAdded(action)) {
    handleNewUserAdd(action, users, timesheet);
  }
}

let lastChecked = "";
function checkIfPosted(users, timesheet) {
  let currentTime = new Date();
  let checkerHour = currentTime.getHours();
  let checkerMinute = Math.floor(currentTime.getMinutes() / 15);
  if ([15, 30, 45].includes(checkerMinute)) {
    checkerMinute = checkerMinute - 15;
  } else {
    checkerMinute = 45;
    if (checkerHour === 0) {
      checkerHour = 23;
    } else {
      checkerHour = checkerHour - 1;
    }
  }
  let checkerTime = checkerHour + ":" + checkerMinute;
  if (lastChecked !== checkerTime) {
    let peopleWhoHadToUpdate = timesheet[checkerTime];
    if(peopleWhoHadToUpdate){
      Object.values(peopleWhoHadToUpdate).then((userId) => {
        if (users[userId].hasUpdated) {
          users[userId].score += 0.5;
          users[userId].hits += 1;
        } else {
          users[userId].score -= 1;
          users[userId].misses += 1;
        }
        users[userId].hasUpdated = false;
      });
    }
    lastChecked = checkerTime;
  }
  Object.values(users).filter(user=>user.score<0).map((user)=>{
    users[user.id].type="banned";
    processGroupAction(updatesGroup,user,"ban");
    informTheAdmins(getUserName(user)+ " has to be banned due to bad score. Please review and change if required");
  })
}

module.exports = {
  groupUserManagementPipeline,
  checkIfPosted,
};
