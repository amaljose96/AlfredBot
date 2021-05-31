const { informTheAdmins } = require("./alfredHelpers");
const { updateGroupId } = require("./constants");
const { getUserName } = require("./telegramHelpers");

function checkIfPersonalMessage(action) {
  return action.type === "message" && action.group.id === action.by.id;
}

function handlePersonalMessage(action, users, timesheet) {
  informTheAdmins(getUserName(action.by) + " is texting me : " + action.text);
}
function checkIfGroupUpdate(action) {
  return action.type === "message" && action.group.id === updateGroupId;
}
function handleGroupUpdate(action, users) {
  let currentTime = new Date(action.time);
  let checkerHour = currentTime.getHours();
  let checkerMinute = Math.floor(currentTime.getMinutes() / 15);
  let checkerTime = checkerHour + ":" + checkerMinute;
  let updater = action.by;
  if (!users[updater.id]) {
    return;
  }
  /**
   * CHECK IF PERSON HAS UPDATED AT THE RIGHT TIME
   */
  let matchingSlot = users[updater.id].slots.find(
    (userSlot) => userSlot.time === checkerTime
  );
  if (!matchingSlot) {
    informTheAdmins(getUserName(updater) + " is spamming. Their slots are at "+users[updater.id].slots.map(slot=>slot.time).join(","))+" Current slot is "+checkerTime;
    users[updater.id].score -= 0.1;
  } else {
    users[updater.id].hasUpdated = true;
  }
}
function mainConversationPipeline(action, users, timesheet) {
  checkIfPersonalMessage(action) &&
    handlePersonalMessage(action, users, timesheet);
  checkIfGroupUpdate(action) && handleGroupUpdate(action, users);
}

module.exports = { mainConversationPipeline };
