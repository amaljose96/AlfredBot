const {
  getSheetsHandler,
  getSheetContent,
  updateSheet,
} = require("./sheetsWrapper");
const { adminsGroupId, locationColumn } = require("./constants");
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
      data.values.forEach((row) => {
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

function checkIfSlotIsTaken(time, location, timeSheet, googleSheet) {
  if (timeSheet[time] && timeSheet[time][location]) {
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

module.exports = {
  loadTimeSheet,
  updateTimesheetAndUsersForNewUser,
  updateGoogleSheetForUser,
  informTheAdmins,
  getUserSlotInfo,
  checkIfSlotIsTaken,
};

/**
 * Polyfill since Im using an old version od Node -Amal
 */
if (!Object.entries)
  Object.entries = function (obj) {
    var ownProps = Object.keys(obj),
      i = ownProps.length,
      resArray = new Array(i); // preallocate the Array

    while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];
    return resArray;
  };
