const db = require("../db");
const { Model, DataTypes } = require("sequelize");
const { storyGenAi } = require("../storyGenAiApi");

/**
 * Chapter model.
 * Represents a chapter in a story.
 * Can generate a new chapter by calling Chapter.generateNewChapter().
 */
class Chapter extends Model {
  /**
   * Create a new chapter.
   * Generates content if none is provided.
   * Generates image and audio if story settings allow.
   * Returns the new chapter.
   */
  static async generateNewChapter(story, userInput) {
    const content = await storyGenAi.generateChapter(story, userInput);
    if (content.validResponse === false) {
      return content;
    }

    const [img, audio] = await Promise.all([
      story.genImages ? storyGenAi.generateImage(content.imgPrompt) : null,
      story.genAudio ? storyGenAi.generateAudio(content.text) : null,
    ]);

    // create new chapter in database.
    const newChapter = await Chapter.create({
      text: content.text.replace(/\n/g, " "), // remove newlines if any
      img: img,
      audio: audio,
      userPrompt: userInput,
      StoryId: story.id,
      title: content.chapterTitle,
    });
    // add additional properties to new chapter
    newChapter.dataValues.validResponse = content.validResponse;
    if (content.validResponse === false) {
      newChapter.dataValues.message = content.message;
    }
    if (content.title) {
      newChapter.title = content.title;
    }
    if (content.setting) {
      newChapter.setting = content.setting;
    }
    newChapter.dataValues.charAlive = content.charAlive;
    newChapter.charAlive = content.charAlive;
    newChapter.newSummary = content.summary;

    return newChapter;
  }

  static async deleteLatestChapter(threadID) {
    const deletedData = await storyGenAi.deleteChapter(threadID);
    return deletedData;
  }
}

Chapter.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    text: {
      type: DataTypes.STRING(5000),
      allowNull: false,
    },
    img: {
      type: DataTypes.BLOB("long"),
      allowNull: true,
    },
    audio: {
      type: DataTypes.BLOB("long"),
      allowNull: true,
    },
    userPrompt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "Chapter",
    tableName: "chapters",
  }
);

module.exports = Chapter;
