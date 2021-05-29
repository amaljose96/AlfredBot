
const { Telegraf, Markup, Scenes, session } = require('telegraf');



class SlotBot {

    BOT_TOKEN = "TOKEN_SHOLD_GO_HERE";
    constructor(timeSheet) {
        this.timeSheet = timeSheet;
        this.bot = new Telegraf(this.BOT_TOKEN)
        this.initializeScene();
        const stage = new Scenes.Stage([this.addToGroupScene], { default: "add_to_group" }); // Scene registration
        this.bot.use(session());
        this.bot.use(stage.middleware());
        this.bot.command('/start', (ctx) => ctx.scene.enter('add_to_group'));
        this.bot.launch();

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


    askConsulateDetails(ctx) {
        ctx.reply(`Please select the consulate
      1. H (Hyderabad)
      2. M (Mumbai)
      3. C (Chennai)
      4. D (Delhi)
      5. K (Kolkata)
  `);
    }

    saveUser() {
        // Save to the sheets API
    }

    initializeScene() {

        this.addToGroupScene = new Scenes.WizardScene(
            "add_to_group",
            ctx => {
                if (ctx.callbackQuery && ctx.callbackQuery.data == 'ADD_TO_GROUP') {
                    ctx.reply(`
                Step1: Enter a time slot. Example: 10:00`);
                    return ctx.wizard.next();
                } else {
                    this.showMessage(ctx);
                    return ctx.scene.leave();
                }
            },
            ctx => {
                const message = ctx.message.text.toLowerCase();
                const timePattern = /([0-9]|0[0-9]|1[0-9]|2[0-3]):([0]|[0-5][0-9])\s*/;
                if (timePattern.test(message)) {
                    ctx.wizard.state.timeslot = message.split(":")[1] == '00' ? message.slice(0, -1) : message;
                    this.askConsulateDetails(ctx);
                    return ctx.wizard.next();
                } else {
                    ctx.reply('Invalid Time format.(Example format: 13:00)');
                    this.showMessage(ctx);
                    return ctx.scene.leave();
                }
            },
            ctx => {
                const consulate = ctx.message.text.toLowerCase();
                const timeslot = ctx.wizard.state.timeslot;
                if (consulate.length == 1 && (consulate == 'h' || consulate == 'm' || consulate == 'c' || consulate == 'd' || consulate == 'k')) {
                    if (this.timeSheet && this.timeSheet[timeslot] && !this.timeSheet[timeslot][consulate.toUpperCase()]) {
                        // Make a call to the Google Sheet API to save the user details
                        saveUser();
                        ctx.reply('Welcome to the group! 👍')
                    } else {
                        ctx.reply(`Slot is already being checked by a peer. Please check the sheet to find an available slot.
                      `);
                    }
                } else {
                    ctx.reply('Please enter valid Consulate Ex: H');
                }

                return ctx.scene.leave();
            }
        );

    }
}
module.exports = SlotBot;

