/**
 * This pipeline monitors and updates users list and timesheet to fill in missing data.
 *  Progress: Complete
 */
const {
  getUserSlotInfo,
  informTheAdmins,
  updateTimesheetAndUsersForNewUser,
  updateGoogleSheetForUser
} = require("./alfredHelpers");
const { getUserName } = require("./telegramHelpers");

function userManagementPipeline(action, users, timeSheet, googleSheet) {
  let actioner = action.by;
  /**
   * IF A USER DOESNT EXIST IN THE SYSTEM
   * 1. Check if existing timeslot user
   * 2. If yes, update everything
   */
  if (!users[actioner.id]) {
    let userSlots = getUserSlotInfo(googleSheet, getUserName(actioner));
    if (userSlots.length !== 0) {
      console.log("User is not synced with local DB");
      updateTimesheetAndUsersForNewUser(actioner, users, timeSheet, userSlots);
      informTheAdmins(
        "User " + getUserName(actioner) + " has been added into local DB"
      );
    } else {
      //If the user does not have a slot, inform the admins.
      informTheAdmins(
        getUserName(actioner) +
          " is in the group. But he doest have a slot yet. Do verify if they are a valid user or kick them out."
      );
    }
  } else {
    let user = users[actioner.id];
    let isFirstNameChanged =
      (user.first_name || actioner.first_name) &&
      actioner.first_name !== user.first_name;
    let isLastNameChanged =
      (user.last_name || actioner.last_name) &&
      actioner.last_name !== user.last_name;
    let isUsernameChanged =
      (user.username || actioner.username) &&
      user.username !== actioner.username;

    if(isFirstNameChanged || isLastNameChanged){
        informTheAdmins(getUserName(user)+" changed his name to "+getUserName(actioner));
    }
    users[user.id] = {
      ...users[user.id],
      first_name: isFirstNameChanged ? actioner.first_name : user.first_name,
      last_name: isLastNameChanged ? actioner.last_name : user.last_name,
      username: isUsernameChanged ? actioner.username : user.username,
    };
    if(isFirstNameChanged || isLastNameChanged){
        updateGoogleSheetForUser(users[user.id]);
    }
  }
}

module.exports = { userManagementPipeline };
