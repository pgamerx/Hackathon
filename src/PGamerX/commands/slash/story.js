const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("story")
    .setDescription("Generate/View different AI-made stories.")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription(
          "Do you want to Generate a story or view other stories?"
        )
        .setRequired(true)
        .addChoice("generate", "gen")
        .addChoice("view", "vi")
    )
    .addStringOption((option) =>
      option
        .setName("start")
        .setDescription(
          "Kindly enter a starting phrase for your story. (eg. I am a storyteller.)"
        )
    ),
  async execute(interaction) {
    const db = interaction.client.db;
    const choice = interaction.options.getString("type");
    if (choice === "gen") {
      const start = interaction.options.getString("start");
      if (!start) {
        await interaction.editReply({
          content: "Please enter a starting phrase for your story.",
          ephemeral: true,
        });
        return;
      }

      // Check if number of words in the starting phrase is more than 20
      const words = start.split(" ");
      if (words.length > 20) {
        await interaction.editReply({
          content: "Please enter a starting phrase with less than 20 words.",
          ephemeral: true,
        });
        return;
      }

      const story = await interaction.client.deepai.callStandardApi(
        "text-generator",
        {
          text: start,
        }
      );

      await db.push("saved", story.output);
      const embed = new MessageEmbed()
        .setTitle("AI-Based Generated Story")
        .setImage(
          `https://deep-aitech.com/wp-content/uploads/2020/08/DeepAi-Logo.png`
        )
        .setDescription(story.output)
        .setColor("GREEN")
        .setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.avatarURL(),
        })
        .setFooter({ text: `Generated by ${interaction.user.username}` });
      await interaction.editReply({
        embeds: [embed],
        ephemeral: true,
      });
      return;
    } else if (choice === "vi") {
      const stories = await db.get("saved");

      // Get a random story from the above array

      // Check if the story exists
      if (stories && stories.length > 0) {
        const story = stories[Math.floor(Math.random() * stories.length)];

        const embed = new MessageEmbed()
          .setTitle("Random AI-Based Story Generated")
          .setImage(
            `https://deep-aitech.com/wp-content/uploads/2020/08/DeepAi-Logo.png`
          )
          .setDescription(story || "No recent stories found.")
          .setColor("GREEN")
          .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.avatarURL(),
          })
          .setFooter({ text: "Generated by an anyonymous user" });


        // Send the story to the user
        await interaction.editReply({
          embeds: [embed],
          ephemeral: true,
        });
        return;
      } else {
        await interaction.editReply({
          content: "There are no stories to view!",
          ephemeral: true,
        });
        return;
      }
    }
  },
};
