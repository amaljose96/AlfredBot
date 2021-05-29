const { getSheetsHandler, getSheetContent } = require("./sheetsWrapper");
const { adminsGroupId } = require("./constants");
const { sendMessage } = require("./telegramHelpers");

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
      console.log(timeSheet);
      return timeSheet;
    });
  });
}
function checkWhoHasToUpdateNow() {
  let currentTime = new Date();
  let checkerHour = currentTime.getHours();
  let checkerMinute = Math.floor(currentTime.getMinutes() / 15);
  let checkerTime = checkerHour + ":" + checkerMinute;
  return timeSheet[checkerTime];
}

function checkAndUpdateTimesheetForNewUser() {

}

function informTheAdmins(message){
    sendMessage(adminsGroupId,message);
}

module.exports = {
  loadTimeSheet,
  checkWhoHasToUpdateNow,
  checkAndUpdateTimesheetForNewUser,
  informTheAdmins
}











/**
 * Polyfill since Im using an old version od Node -Amal
 */
 if (!Object.entries)
 Object.entries = function( obj ){
    var ownProps = Object.keys( obj ),
       i = ownProps.length,
       resArray = new Array(i); // preallocate the Array

    while (i--)
       resArray[i] = [ownProps[i], obj[ownProps[i]]];
    return resArray;
 };