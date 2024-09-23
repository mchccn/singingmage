import { data } from "./data";
import { SingingMage } from "./SingingMage";

register("chat", () => {
    setTimeout(() => {
        if (data.enabled) ChatLib.chat(`&c&l[SingingMage] &r&fQuery set to: &a${data.query}`);
        else ChatLib.chat(`&c&l[SingingMage] &r&fSinging is currently &4disabled`);
    }, 1500);
}).setCriteria("Welcome to Hypixel SkyBlock${after}");

register("command", (...args) => {
    if (!args[0]) {
        data.enabled = !data.enabled;
        data.save();

        ChatLib.chat(`&c&l[SingingMage] &r&fSinging is now ${data.enabled ? "&2enabled" : "&4disabled"}&f!`);
    } else {
        data.query = args.join(" ");
        data.save();

        ChatLib.chat(`&c&l[SingingMage] &r&fSet the query to &a${data.query}&f!`);
    }
})
    .setName("singingmage")
    .setAliases("mocha")
    .setAliases("sm");

register("chat", () => {
    if (!data.enabled) return ChatLib.chat(`&c&l[SingingMage] is currently &4disabled&f!`);

    console.log(data.query);

    core(data.query.replace(/\s+/g, "+"), (x) => ChatLib.command(`pc ${x}`));
}).setCriteria("The BLOOD DOOR has been opened!");

register("chat", () => {
    kill();
}).setCriteria("[BOSS] The Watcher: You have proven yourself. You may pass.");

register("command", (...args) => {
    core(args.join("+"), (x) => ChatLib.chat(x));
})
    .setName("singingmagetest")
    .setAliases("sing")
    .setAliases("smt");

register("command", (...args) => {
    core(args.join("+"), (x) => ChatLib.command(`pc ${x}`));
}).setName("singpartychat");

register("command", (...args) => {
    core(args.join("+"), (x) => ChatLib.command(`ac ${x}`));
}).setName("singallchat");

register("command", (...args) => {
    [victim, ...args] = args;

    core(args.join("+"), (x) => ChatLib.command(`msg ${victim} ${x}`));
}).setName("singdm");

register("command", () => {
    kill();
}).setName("killsinger");

function core(query, fn) {
    try {
        const text = FileLib.getUrlContent("https://lrclib.net/api/search?q=" + query);

        const raw = JSON.parse(text)[0].syncedLyrics;

        const parsed = raw
            .split("\n")
            .filter(Boolean)
            .map((line) => {
                const [timestamp, lyric] = line
                    .trim()
                    .slice(1)
                    .split("]")
                    .map((x) => x.trim());

                const [minutes, seconds] = timestamp.split(":").map(Number);

                const ms = Math.round((minutes * 60 + seconds) * 1000);

                const formatted = lyric
                    .toLowerCase()
                    .replace(/in'/g, "ing")
                    .replace(/[,?!\.]$/, "")
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .trim();

                if (!formatted) return undefined;

                return [formatted, ms];
            })
            .filter(Boolean);

        const first = parsed[0][1];
        parsed.forEach((x) => (x[1] -= first));

        const singer = new SingingMage(fn, () => ChatLib.chat(`&c&l[SingingMage] &r&fDone singing!`));

        console.log(parsed);

        parsed.forEach(([lyric, delay], i) => singer.read(lyric, delay - (parsed[i - 1] ? parsed[i - 1][1] : 0)));

        singer.sing();
    } catch (error) {
        console.log(error);

        ChatLib.chat(`&c&l[SingingMage] &r&cFailed to fetch lyrics!`);
    }
}

function kill() {
    SingingMage.instances.forEach((singer) => (singer.killed = true));

    SingingMage.instances = [];

    ChatLib.chat(`&c&l[SingingMage] &r&cKilled the singing mage!`);
}
