# TalkingBot
# Custom Commands
`[commandname]` and `[aliasname]` must start with a `!` and can't have a space in them.
## Adding Commands
`!addcmd [commandname] [response]` this will create a command called `[commandname]` that will respond with `[response]` when used.
`!editcmd [commandname] [response]` this will edit the command `[commandname]` to respond with `[response]`.
`!addtocmd [commandname] [response]` this will add `[response]` to the end of `[commandname]`'s current respone. This can be used to create a command longer than the 500 characther limit on twitch.
### Response syntax
- `$user` will be replaced by the user's name who used the command.
- `$args` will be replaced by everything the user put after the command.
- `(modonly)` will make the command mod only can be put anywhere in `[response]`.
- `(reply)` will make the command reply to the message where the command was in.
- `suffix(n)` will add a ordinal suffix after n for example `suffix(791)` becomes `791st` can be used with `fetch()`.
- `fetch[url]` will perform a get request on `url` and return the result.
- `fetch[url]{key}` will perform a get request on `url`, return the json value of `key`.
#### Script
`script()` can be used to run JS code
##### Variables
- `user` the username of the person who used the command. 
- `args`  array of the arguments the user gave.
- `platform` the platform command was used in (twitch/youtube/kick).
- `result` `script()` will be replaced with `result`.

- `pet.currentPet.birthDate` string, the date pet was born on in JSON format   
- `pet.currentPet.name` number, the name of the pet. like 21 of Hapboo #21
- `pet.currentPet.stomach` number, pet's current stomach between 0 and 4 (inclusive)
- `pet.currentPet.age` number
- `pet.currentPet.status` enum, 0: egg, 1: hatching, 2: alive, 3: dead

- `pet.feedOrFuel(username: string)` takes the username and returns true if the pet shield was active and the user tried to kill.

##### Functions
- `say([message],[reply])` will say `[message]` in chat, replies to the user if `[reply]` is true.
- `banUser(reason, duration)`reason: string, duration: number, will ban/timeout the user with the reason `reason` and duration `duration`.
- `broadcast([message])` will say `[message]` in every chat.
- `fetch()` https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch
- `milliSecondsToString([milliSeconds])` will convert `[milliSeconds]` to minutes and seconds.
- `getSuffix(number)` gets a number returns a string with that number + its ordinal suffix. for example getSuffix(12) returns "12th".
- `getRandomElement(array)` returns a random element from a string array.
- `runCommand(command)` will run `command` can be a custom or builtin command and can have arguments like `runCommand(`!kill ${user}`)`}
##### Example
- ``!addcmd !sr script( const categories = await (await fetch(`https://www.speedrun.com/api/v1/games/${args[0]}/categories`)).json();const leaderboards = await (await fetch(categories.data[0].links[5].uri)).json();const player =  await (await fetch(leaderboards.data.runs[0].run.players[0].uri)).json();result = `World record holder in game ${args[0]} is ${player.data.names.international};`)``
## Removing Commands
`!delcmd [commandname]` will remove the command `[commandname]` if it exists.
## Aliasing Commands
`!aliascmd [aliasname] [commandname]` will alias `[aliasname]` to `[commandname]` so when `[aliasname]` is ran `[commandname]` will run.
`!delalias [aliasname]` will remove `[aliasname]`.
## Seeing Commands
`!showcmd [commandname]` will show the `[response]` of `[commandname]`.
# Redeems
Channel point redeems that require mod approval will be put on a queue. These commands will apply to the first redeem in queue(the one redeemed first).
`!reedem approve` will approve the redeem and mark the redeem as complete.
`!reedem reject` will refund the channel points.
`!reedem scam` will mark the redeem as complete but won't approve the redeem.
# TTS
- `!modtts enable` enables the `!tts` command.
- `!modtts disable` disables the `!tts` command.
- `!modtts pause` pauses the tts, new messages will be qued until unpaused.
- `!modtts unpause` unpauses the tts.
- `!modtts skip` will skip the current tts being played.
- `!modtts skip [user]` will skip every message by `[user]` in the queue.
- `!modtts say [message]` will say `[message]` even if command is disabled or tts is paused.
# Wheeeel
- `!wheel add [rewardname] [rewardweight] [rewardcolor]` adds a reward to the wheel with name `[rewardname]`, weight `[rewardweight]`, and color `[rewardcolor]`.
  `[rewardcolor]` is an [html color name](https://www.w3schools.com/colors/colors_names.asp) like `red` or an hex color like `#048ac7`.
  `[rewardcolor]` is optional if not provided the reward will be pink. 
- `!wheel remove [rewardname]` will remove reward `[rewardname]`.
- `!wheel spin` will spin the wheel.
- `!wheel weights` will show the current rewards and their weights.
- `!wheel` will show the current rewards and their percentages.
- `!wheel chat @user` will spin the wheel for `user`.
# Tags
`[tags]` can have more than one tag seperated by a space.
`!tags` will show the current stream tags.
`!tags add [tags]` will add the `[tags]` to the stream tags. 
`!tags remove [tags]` will remove the `[tags]` from the stream tags.
# Title 
`!settitle [title]` will set the stream title to `[title]`.
`!tempsettitle [title]` will set the stream title to `[title]` after 15 minutes will change it back.
## Dyntitle 
`!dyntitle [title]` will update the stream title with `[title]` every minute.
`[title]` can have `fetch(url)` and `suffix(n)` see [Response syntax](#Response-syntax).
## Permtitle
`!permtitle [title]` will change the title to `[title]`. 
after the stream is over the YouTube title will be set to `[title] (game)`.
# Counter
`!counter [name]` will show the value of the counter `[name]`.
`!counter [name] n` will set the counter `[name]` to n.
`!counter [name] +n` will add n to the counter `[name]`.
`!counter [name] -n` will subtract n from the counter `[name]`.

# Modtext
`!modtext [text]` will change the modtext to `[text]`.
`!tempmodtext [text]` will change the modtext to `[text]` after 15 minutes will change it back.
`[text]` can have `$counter` which will show the current counter.
# Snipe
 Made by [SweetbabooO_o](https://www.youtube.com/watch?v=9dhKjWy4v08)
 - `!snipe [name]` will find 3 beat saber songs that `[name]` has a better score than streamer and will bsr them.
# Game
`!setgame [game]` will change the stream category to `[game]`.
# Pet
- `!pet sleep` will make him sleep as if the stream ended.
- `!pet continue` will wake up the hapboo but won't continue the hatching or increase the age.
- `!pet start` will wake up the hapboo and will continue the hatching or increase the age.
- `!pet write` will save the hapboo state on the config file.
- `'pet read` will read the hapboo state from the config file.
- `!pet protect` will activate the hapboo shield.
- `!pet tick` will do a hapboo tick.
# Misc 
- `!senddiscordping` will send stream ping on discord
