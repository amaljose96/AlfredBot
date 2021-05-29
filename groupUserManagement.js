const { checkAndUpdateTimesheetForNewUser, informTheAdmins, getUserName } = require("./alfredHelpers");
const { processGroupAction } = require("./telegramHelpers");
const { updatesGroup } = require("./constants");

/**
 * This module checks every user update in the group
 * 1. If new user is added -> check if name in user details CSV or time sheet else kick
 */

function checkIfNewUserWasAdded(action) {
  return action.type === "new_users_added" && action.group.id === updatesGroup;
}

function handleNewUserAdd(action, users, timesheet,googleSheet) {
  let { addedUsers, group } = action;
  addedUsers.forEach((addedUser) => {
    //Check if user is in users list. If not
    if (users[addedUser.id]) {
      checkAndUpdateTimesheetForNewUser(addedUser,users,timesheet,googleSheet);
    }
    else{
        informTheAdmins(getUserName(addedUser)+" was kicked for not choosing timeslot");
        processGroupAction(group, addedUser, "kick");
    }
  });
}

function groupUserManagementPipeline(action, users, timesheet) {
  if (checkIfNewUserWasAdded(action)) {
    handleNewUserAdd(action, users, timesheet);
  }
}

module.exports = {
  groupUserManagementPipeline,
};
