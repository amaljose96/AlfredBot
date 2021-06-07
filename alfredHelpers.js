const {
  getSheetsHandler,
  getSheetContent,
  updateSheet,
} = require("./sheetsWrapper");
const { adminsGroupId, discussionsGroupId, locationColumn } = require("./constants");
const { sendMessage, getUserName } = require("./telegramHelpers");

const locations = {
  D: "Delhi",
  M: "Mumbai",
  K: "Kolkata",
  H: "Hyderabad",
  C: "Chennai",
};

function loadTimeSheet() {
  let timeSheet = {};
  return getSheetsHandler().then((sheetHandler) => {
    return getSheetContent(sheetHandler).then((data) => {
      let pointerTime = new Date();
      pointerTime.setHours(0);
      pointerTime.setMinutes(0);
      data.values.slice(1).forEach((row) => {
        let lineData = {};
        Object.keys(locations).forEach((header, index) => {
          lineData[header] = row[index + 2];
        });
        let timeStamp = pointerTime.getHours() + ":" + pointerTime.getMinutes();
        timeSheet[timeStamp] = lineData;
        if (pointerTime.getMinutes() === 45) {
          let newHour = pointerTime.getHours() + 1;
          pointerTime.setHours(newHour);
          pointerTime.setMinutes(0);
        } else {
          pointerTime.setMinutes(pointerTime.getMinutes() + 15);
        }
      });
      console.log(timeSheet)
      return timeSheet;
    });
  });
}

function getUserSlotInfo(timeSheet, userId) {
  let userSlotInfo = [];
  Object.keys(timeSheet)
    .filter((time) => {
      let intervalSlots = timeSheet[time];
      return Object.values(intervalSlots).includes(userId);
    })
    .forEach((interestingTime) => {
      let interestingSlot = timeSheet[interestingTime];
      Object.keys(interestingSlot).forEach((location) => {
        if (interestingSlot[location] === userId) {
          userSlotInfo.push({
            location,
            time: interestingTime,
          });
        }
      });
    });
  return userSlotInfo;
}

function updateTimesheetAndUsersForNewUser(newUser, users, timeSheet, slots) {
  slots.forEach((userSlot) => {
    if (!timeSheet[userSlot.time]) {
      timeSheet[userSlot.time] = {};
    }
    timeSheet[userSlot.time][userSlot.location] = newUser.id;
  });
  users[newUser.id] = {
    ...newUser,
    type: "updater",
    score: 10,
    hits: 0,
    misses: 0,
    slots,
  };
}

function updateGoogleSheetForUser(user) {
  let cellUpdates = user.slots.map((slot) => {
    let rowNumber =
      1 +
      parseInt(slot.time.split(":")[0]) * 4 +
      parseInt(slot.time.split(":")[1]) / 15;
    return {
      cell: locationColumn[slot.location] + rowNumber,
      value: getUserName(user),
    };
  });

  updateSheet(cellUpdates);
}

function checkIfSlotIsTaken(time, location, timeSheet, googleSheet = {}) {
  if (timeSheet && timeSheet[time] && timeSheet[time][location]) {
    return true;
  }
  if (
    googleSheet[time] &&
    googleSheet[time][location] &&
    googleSheet[time][location] !== ""
  ) {
    return true;
  }
  return false;
}

function informTheAdmins(message) {
  sendMessage(adminsGroupId, message);
}


function informEveryone(message) {
  sendMessage(discussionsGroupId, message);
}


module.exports = {
  loadTimeSheet,
  updateTimesheetAndUsersForNewUser,
  updateGoogleSheetForUser,
  informTheAdmins,
  getUserSlotInfo,
  checkIfSlotIsTaken,
  informEveryone
};

