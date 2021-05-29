const { checkAndUpdateTimesheetForNewUser, informTheAdmins, getUserName } = require("./alfredHelpers");
const { processGroupAction } = require("./telegramHelpers");

/**
 * This module checks every user update in the group
 * 1. If new user is added -> check if name in user details CSV or time sheet else kick
 */
let updatesGroup = "";

function checkIfNewUserWasAdded(action) {
  return action.type === "new_users_added" && action.group.id === updatesGroup;
}

function handleNewUserAdd(action, users, timesheet) {
  let { addedUsers, group } = action;
  addedUsers.forEach((addedUser) => {
    let decision = "kick";
    //Check if user is in users list.
    if (users[addedUser.id]) {
      decision = "safe";
      checkAndUpdateTimesheetForNewUser(addedUser);
    }
    else{
        informTheAdmins(getUserName(addedUser)+" was kicked for not choosing timeslot");
        processGroupAction(group, addedUser, "kick");
    }
    
  });
}

function userManagementPipeline(action, users, timesheet) {
  if (checkIfNewUserWasAdded(action)) {
    handleNewUserAdd(action, users, timesheet);
  }
}

module.exports = {
  userManagementPipeline,
};
