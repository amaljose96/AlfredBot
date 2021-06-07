
const { Telegraf, Markup, Scenes, session } = require('telegraf');
const moment = require('moment');
const { checkIfSlotIsTaken, getUserSlotInfo, updateUserSlots, updateTimesheetAndUsersForNewUser, updateGoogleSheetForUser } = require('./alfredHelpers');

class AddUserToGroupBot {

    constructor(timeSheet, users) {
        this.users = users;
        this.timeSheet = timeSheet;
        this.BOT_TOKEN = process.env.TELLERTOKEN;
        this.bot = new Telegraf(this.BOT_TOKEN)
        this.initializeScenes();
        const stage = new Scenes.Stage([this.scenarioTypeScene, this.addToGroupScene, this.deleteSlotScene]); // Scene registration
        this.bot.use(session());
        this.bot.use(stage.middleware());
        this.bot.command('/start', Scenes.Stage.enter('SCENARIO_TYPE_SCENE_ID'));
        this.bot.launch();
    }

    startBot() {
        this.bot.start(ctx => {

        });
    }




    askConsulateDetails(ctx, additionalMessage = "") {
        ctx.reply(`${additionalMessage}Which consulate would you like to check?
      1. H (Hyderabad)
      2. M (Mumbai)
      3. C (Chennai)
      4. D (Delhi)
      5. K (Kolkata)
  `);
    }

    saveUser(ctx, location, time) {
        const user = ctx.message.from;
        const currentSlots = this.users[user.id] && this.users[user.id] && this.users[user.id]['slots'] ? this.users[user.id]['slots'] : [];
        currentSlots.push({ location, time });
        // Will have to implement promise after the api call code is added
        updateTimesheetAndUsersForNewUser(user, this.users, this.timeSheet, currentSlots);
        user.slots = currentSlots;
        updateGoogleSheetForUser(user);
        // Save to the sheets API
        return Promise.resolve(true);
    }

    initializeDeleteSlotScene() {
        this.deleteSlotScene = new Scenes.WizardScene(
            "delete_slot",
            ctx => {
                try {
                    // console.log(ctx.update.callback_query.from.id);
                    const userId = ctx.update.callback_query.from.id;
                    const slotInfo = getUserSlotInfo(this.timeSheet, userId);
                    if (slotInfo && slotInfo.length > 0) {
                        let temp = `You current slot details:`;
                        slotInfo.forEach(slot => {
                            temp += `${slot.time} - ${slot.location}, `;
                        })
                        ctx.wizard.state.slots = slotInfo;
                        ctx.reply(`${temp}: Please Enter the time slot you want to remove, Example: 9:30-H
                        `)
                        return ctx.wizard.next();
                    } else {
                        ctx.reply(`You dont have a slot yet. Please pick a slot first!`);
                        ctx.scene.leave();
                        ctx.scene.enter('SCENARIO_TYPE_SCENE_ID')
                    }
                } catch (e) {
                    console.log(e);
                    ctx.reply('Something went wrong! Please click /start to try again or contact the admin if the issue persists')
                    return  ctx.scene.leave();
                }
            },
            ctx => {
                try {
                    const message = ctx.message.text.toLowerCase().split("-");
                    const timeSlot = message[0];
                    const consulate = message[1].toUpperCase();
                    const user = ctx.message.from;
                    if (moment(timeslot, ["h:mm A"]).isValid()) {
                        timeSlot = moment(timeslot, ["h:mm A"]).format("HH:mm");
                        timeslot = timeslot.split(":")[1] == '00' ? timeslot.slice(0, -1) : timeslot;
                        const userSlots = ctx.wizard.state.sots;
                        const selectedSlot = userSlots.filter(slot => slot.time == timeSlot && slot.location == consulate);
                        if (selectedSlot && selectedSlot.length == 1) {
                            this.timeSheet[timeslot][consulate] = '';
                            const filteredSlots = userSlots.filter(slot => slot.time != timeSlot && slot.location != consulate);
                            updateUserSlots(user, filteredSlots);
                            ctx.reply('Slot removed successfully!').then(res => ctx.scene.leave()).catch(res => ctx.scene.leave());
                        } else {
                            ctx.reply('Invalid selection. Please try again!').then(res => ctx.scene.leave());
                        }
                    } else {
                        ctx.reply('Invalid Time format.(Example format: 10:00AM)').then(res => {
                            ctx.wizard.back();  // Set the listener to the previous function
                            ctx.wizard.state.processInProgess = true;
                            return ctx.wizard.steps[ctx.wizard.cursor](ctx);
                        }).catch(err => ctx.scene.leave());

                    }
                } catch (e) {
                    console.log(e);
                    ctx.reply('Something went wrong! Please click /start to try again or contact the admin if the issue persists')
                    return ctx.scene.leave();
                }
            }

        );
    }

    replyError(ctx) {
        ctx.reply('Something went wrong, Try again or contact the admin');
    }


    initializeAddSlotScene() {
        this.addToGroupScene = new Scenes.WizardScene(
            "add_to_group",
            ctx => {
                ctx.reply(`Please enter the time you'd like to check. Example: 10:00AM or Enter 'q' to exit`).then(res => { ctx.wizard.next() })
                    .catch(err => ctx.scene.leave());
            },
            ctx => {
                try {
                    const message = ctx.message.text.toLowerCase();
                    if (message == 'q') {
                        ctx.reply('Thanks for your time!');
                        return ctx.scene.leave();
                    }
                    if (moment(message, ["h:mm A"]).isValid()) {
                        ctx.wizard.state.timeslot = message;
                        this.askConsulateDetails(ctx);
                        return ctx.wizard.next();
                    } else {
                        ctx.reply('Invalid Time format.(Example format: 10:00AM)').then(res => {
                            ctx.wizard.back();  // Set the listener to the previous function
                            ctx.wizard.state.processInProgess = true;
                            return ctx.wizard.steps[ctx.wizard.cursor](ctx);
                        }).catch(err => ctx.scene.leave());

                    }
                } catch (e) {
                    ctx.reply('Something went wrong! Please click /start to try again or contact the admin if the issue persists')
                    return ctx.scene.leave();
                }
            },
            ctx => {
                try {
                    const consulate = ctx.message.text.toLowerCase();
                    let selectedTimeSlot = ctx.wizard.state.timeslot;
                    let timeslot = moment(selectedTimeSlot, ["h:mm A"]).format("HH:mm");
                    // Fix to handle timeslots ending with 00.
                    timeslot = timeslot.split(":")[1] == '00' ? timeslot.slice(0, -1) : timeslot;
                    if (consulate.length == 1 && (consulate == 'h' || consulate == 'm' || consulate == 'c' || consulate == 'd' || consulate == 'k')) {
                        if (!checkIfSlotIsTaken(timeslot, consulate.toUpperCase(), this.timeSheet)) {
                            this.saveUser(ctx, consulate.toUpperCase(), timeslot).then(res => {
                                ctx.reply('You have been added to the group 👍. Do go through the pinned messages. Check @f1discussionsjunejuly for doubts. ')
                                return ctx.scene.leave();
                            }).catch('Oops! Something went wrong. Please try again');
                        } else {
                            ctx.reply(`Sorry ${selectedTimeSlot} is not free. Please check the sheet.
                      `).then(res => {
                                ctx.wizard.selectStep(0);
                                ctx.wizard.state.processInProgess = true;
                                return ctx.wizard.steps[ctx.wizard.cursor](ctx);
                            }).catch(err => ctx.scene.leave());
                        }
                    } else {
                        // ctx.reply('Please enter a valid Consulate Ex: H')
                        this.askConsulateDetails(ctx, 'Invalid consulate \n');
                    }
                } catch (e) {
                    console.log(e);

                    ctx.reply('Something went wrong! Please click /start to try again or contact the admin if the issue persists')
                    return ctx.scene.leave();
                }
            }
        );

    }

    initializeBaseScene() {
        this.scenarioTypeScene = new Scenes.BaseScene('SCENARIO_TYPE_SCENE_ID');

        this.scenarioTypeScene.enter((ctx) => {
            ctx.session.myData = {};
            ctx.reply('Hello, I am Alfred. I am here to assist you with F1 VISA UPDATES group.', Markup.inlineKeyboard([
                Markup.button.callback("Add to the group", "ADD_ACTION"),
                Markup.button.callback("Delete Slot", "DELETE_ACTION")
            ]));
        });

        this.scenarioTypeScene.action('ADD_ACTION', (ctx) => {
            return ctx.scene.enter('add_to_group');
        });

        this.scenarioTypeScene.action('DELETE_ACTION', (ctx) => {
            return ctx.scene.enter('delete_slot'); // exit global namespace
        });

        this.scenarioTypeScene.leave((ctx) => {
            // ctx.reply('Thank you for your time!');
            // Scenes.Stage.enter('SCENARIO_TYPE_SCENE_ID')
        });

        // What to do if user entered a raw message or picked some other option?
        this.scenarioTypeScene.use((ctx) => ctx.replyWithMarkdown('Please choose either Add or Remove Slot'));
    }

    initializeScenes() {
        this.initializeAddSlotScene();
        this.initializeDeleteSlotScene();

        this.initializeBaseScene();

    }
}
module.exports = AddUserToGroupBot;

