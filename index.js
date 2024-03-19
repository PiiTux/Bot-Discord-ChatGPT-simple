require("dotenv").config();
const { Client } = require("discord.js");
const { OpenAI } = require("openai");

const client = new Client({
    intents: [
        "Guilds",
        "GuildMessages",
        "MessageContent"
    ]
});

client.once("ready", client => {
    console.log(`Prêt ! Connecté en tant que ${client.user.tag}`);
});

client.on("messageCreate", async message => {
    if (message.system || message.author.bot || !message.content) return;
    if (!message.mentions.has(client.user)) return;

    const openai = new OpenAI({ apiKey: process.env.API_KEY });
    const chatCompletion = { model: "gpt-3.5-turbo" };
    chatCompletion.messages = [{ role: "system", content: "Tu es un assistant utile. Ajoute des émojis dans tes réponses toujours courtes." }];

    await message.channel.sendTyping();
    const messages = await message.channel.messages.fetch({ limit: 9 });
    messages.reverse();

    messages.forEach(msg => {
        if (msg.system) return;
        if (!msg.content) return;
        if (msg.author.bot && msg.author.id !== client.user.id) return;

        chatCompletion.messages.push({
            role: msg.author.bot ? "assistant" : "user",
            content: msg.content
        });
    });

    message.reply((await openai.chat.completions.create(chatCompletion)).choices[0].message.content);
});

client.login(process.env.TOKEN);
