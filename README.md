# attendance-list-bot
This is a Telegram bot using NodeJS and Firebase. It's running on the Heroku.
Username: @AttendanceListBot


## Telegram Settings

1. Create your own bot. [How do you create a bot?](https://core.telegram.org/bots#3-how-do-i-create-a-bot)
2. Grab your TOKEN.

## Firebase Settings

1. Create your Firebase. [How do you create a firebase?](https://console.firebase.google.com/)
2. Set project name and country/region.
3. Access "Permissions" in Settings.
4. In "Service Accounts" create an account.
5. Set Service Account name as Editor.
6. Choose option to provide a new private key. (Download JSON file).
7. Replace YOUR-SECURITY-PRIVATE-KEY.json file.
8. Update your firebase credentials in the FirebaseManager.js file, line 6.
9. That's it.

## Heroku Settings

1. Create the [Heroku account](https://heroku.com) and install the [Heroku Toolbelt](https://toolbelt.heroku.com/).
2. Login to your Heroku account using `heroku login`.
3. Go to the app's folder using `cd ~/attendance-list-bot`
4. Run `heroku create [name-is-optional]` to prepare the Heroku environment.

## Files Settings
Before you deploy the heroku, you must setting the files with your data.

### Change .env file
NODE_ENV=development
TOKEN=PUT-YOUR-TELEGRAM-TOKEN

### Change bot.js file
Line 10: Set your heroku app URL: bot.setWebHook('YOUR-APP-URL' + bot.token);


##Deploy your bot to the Heroku

1. Run `heroku config:set TOKEN=SET HERE THE TOKEN YOU'VE GOT FROM THE BOTFATHER`.
2. Run `git add -A && git commit -m "Ready to run on heroku" && git push heroku master` to deploy your bot to the Heroku server.
3. Test your bot.
