# TalkingBot
# Custom Commands
`[commandname]` and `[aliasname]` must start with a `!` and can't have a space in them.
## Adding Commands
`!addcmd [commandname] [response]` 
this will create a command called `[commandname]` that will respond with `[response]` when used.
### Response syntax
- `$user` will be replaced by the user's name who used the command.
- `$args` will be replaced by everything the user put after the command.
- `(modonly)` will make the command mod only can be put anywhere in `[response]`.
- `(reply)` will make the command reply to the message where the command was in.
- `suffix(n)` will add a ordinal suffix after n for example `suffix(791)` becomes `791st` can be used with `fetch()`.
- `fetch[url]` will perform a get request on `url` and return the result.
- `fetch[url]{key}` will perform a get request on `url`, return the json value of `key`.
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
Mods can always use `!tts` and disable or enable it for non-mods using `!modtts enable` or `!modtts disable`
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
## Dyntitle 
`!dyntitle [title]` will update the stream title with `[title]` every minute.
`[title]` can have `fetch(url)` and `suffix(n)` see [Response syntax](#Response-syntax).
## Permtitle
`!permtitle [title]` will change the title to `[title]`. 
after the stream is over the YouTube title will be set to `[title] (game)`.
# Counter
`!counter` will show the current counter.
`!conter n` will set the counter to n.
`!counter +n` will add n to the counter.
`!counter -n` will subtract n from the counter.
# Modtext
`!modtext [text]` will change the modtext to `[text]`.
`[text]` can have `$counter` which will show the current counter.
`!hapboo` will improve the stream.
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
