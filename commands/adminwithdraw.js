//BN lib.
var BN = require("bignumber.js");
BN.config({
    ROUNDING_MODE: BN.ROUND_DOWN,
    EXPONENTIAL_AT: process.settings.coin.decimals + 1
});

module.exports = async (msg) => {
    //Only enable this for DM messages
    if (msg.obj.channel.type != "dm") return;

    //Check if user is an active admin.
    if (!process.core.users.isAdmin(msg.sender)) return;

    //Check the argument count.
    if (msg.text.length !== 2) {
        msg.obj.reply("You used the wrong amount of arguments.");
        return;
    }

    //Get the destination from the command.
    var address = msg.obj.content
        .split(" ").filter((item) => {
            return item !== "";
        }).join(" ")
        .substring(1, msg.obj.content.length)
        .replace(new RegExp("\r", "g"), "")
        .replace(new RegExp("\n", "g"), "")
        .split(" ")[1];
    
    //If we own that address...
    if (await process.core.coin.ownAddress(address)) {
        msg.obj.reply("You cannot withdraw to me. It's just network spam...");
        return;
    }

    var amount = process.core.coin.getTokenBalance(process.settings.coin.addresses.wallet);

    var hash = await process.core.coin.send(address, amount);
    if (typeof(hash) !== "string") {
        msg.obj.reply("Our node failed to create a TX! Is your address invalid?");
        await process.core.users.addBalance(msg.sender, BN(amount));
        return;
    }

    msg.obj.reply("Success! Your TX hash is " + hash + ".");
};