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
  console.log(
    "Checking if group message",
    action.group,
    "Updates : ",
    updateGroupId,
    " Match=",
    action.group.id === updateGroupId
  );
  return action.type === "message" && action.group.id === updateGroupId;
}
function handleGroupUpdate(action, users, timesheet) {
  informTheAdmins(
    getUserName(action.by) + " posted in group : " + action.text
  );
}
function mainConversationPipeline(action, users, timesheet) {
  checkIfPersonalMessage(action) &&
    handlePersonalMessage(action, users, timesheet);
  checkIfGroupUpdate(action) && handleGroupUpdate(action, users, timesheet);
}

module.exports = { mainConversationPipeline };
