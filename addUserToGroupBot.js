
const { Telegraf, Markup, Scenes, session } = require('telegraf');
const moment = require('moment');
const { checkIfSlotIsTaken } = require('./alfredHelpers');

class AddUserToGroupBot {

    constructor(timeSheet) {
        this.timeSheet = timeSheet;
        this.BOT_TOKEN = process.env.TELLERTOKEN;
        this.bot = new Telegraf(this.BOT_TOKEN)
        this.initializeScene();
        const stage = new Scenes.Stage([this.addToGroupScene], { default: "add_to_group" }); // Scene registration
        this.bot.use(session());
        this.bot.use(stage.middleware());
        this.bot.command('/start', (ctx) => ctx.scene.enter('add_to_group'));
        this.registerHearHanlders();
        this.bot.launch();

    }


    registerHearHanlders(){
        this.bot.hears('exit', (ctx) => {
            this.showMessage();
            return ctx.scene.leave();
        });
    }

    startBot() {
        this.bot.start(ctx => {
            this.showMessage(ctx);
        });
    }


    showMessage(ctx) {
        const message = `
    Hello, I am Alfred. I am here to assist you with F1 VISA UPDATES group.
    `;
        ctx.reply(message, Markup.inlineKeyboard([
            Markup.button.callback("Add to the group", "ADD_TO_GROUP")
        ]));
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

    saveUser() {
        // Save to the sheets API
        return Promise.resolve(true);
    }

    initializeScene() {
        this.addToGroupScene = new Scenes.WizardScene(
            "add_to_group",
            ctx => {
                if ((ctx.callbackQuery && ctx.callbackQuery.data == 'ADD_TO_GROUP') || (ctx.wizard.state.processInProgess)) {
                    ctx.reply(`Please enter the time you'd like to check. Example: 10:00AM`).then(res => ctx.wizard.next())
                        .catch(err => ctx.scene.leave());
                } else {
                    this.showMessage(ctx);
                    return ctx.scene.leave();
                }
            },
            ctx => {
                const message = ctx.message.text.toLowerCase();
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
            },
            ctx => {
                const consulate = ctx.message.text.toLowerCase();
                let selectedTimeSlot = ctx.wizard.state.timeslot;
                let timeslot = moment(selectedTimeSlot, ["h:mm A"]).format("HH:mm");
                console.log('Slot ----->', timeslot);
                // Fix to handle timeslots ending with 00.
                timeslot = timeslot.split(":")[1] == '00' ? timeslot.slice(0, -1) : timeslot;
                if (consulate.length == 1 && (consulate == 'h' || consulate == 'm' || consulate == 'c' || consulate == 'd' || consulate == 'k')) {
                    if (!checkIfSlotIsTaken(timeslot, consulate.toUpperCase(), this.timeSheet)) {
                        this.saveUser().then(res => {
                            ctx.reply('You have been added to the group 👍. Do go through the pinned messages. Check @f1julydiscussions for doubts. ')
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
            }
        );

    }
}
module.exports = AddUserToGroupBot;

