import axios from "axios";
import OpenAI from "openai";
import fs from "fs";
import data from "./finialDataAi.json" assert { type: "json" };
const api = "https://peakato.com/api/v1";

const openai = new OpenAI({
  apiKey: "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",
});

const loginAdmin = async () => {
  const data = {
    username: "",
    password: "",
  };
  let result = await axios.post(`${api}/login/email/`, data);
  return result.token;
};

const handelLoopForAllData = async (list) => {
  let i = 0;
  for (i == 0; i < list.length; i++) {
    let chatGptResult = await chatGptMakeRequest(list[i]);
    await sendNewRecordToPeakato(chatGptResult, i);
    await new Promise((resolve) => setTimeout(resolve, 30000));
  }
};

const main = async () => {
  handelLoopForAllData(data);
};

const chatGptMakeRequest = async (message) => {
  if (message?.guide.length >= 1) {
    if (!message?.guideRephrase.length >= 1) {
      try {
        const completion = await openai.chat.completions.create({
          messages: [
            {
              role: "user",
              content: `i want you to rephrase my sentences that i will send for you, but i want you to dont say anything expect for the repharase sentence cuz i am using the data you send me and write it in data base. my sentence : ${message.guide}`,
            },
          ],
          model: "gpt-3.5-turbo",
        });
        return completion.choices;
      } catch (err) {
        console.log("sag", err);
      }
    } else {
      return "@";
    }
  } else {
    return "@";
  }
};

const sendNewRecordToPeakato = async (chatGptResult, index) => {
  console.log("mine", chatGptResult);
  if (chatGptResult == "@") {
    let newData = data[index];
    var jsonContent = JSON.stringify(newData);
    fs.appendFileSync("OutPut.json", " , \n" + jsonContent);
    return;
  }
  if (chatGptResult == undefined) {
    await new Promise((resolve) => setTimeout(resolve, 60000));
    let newData = data[index];
    newData.guideRephrase = "limit reached";
    var jsonContent = JSON.stringify(newData);
    fs.appendFileSync("OutPut.json", " , \n" + jsonContent);

    return;
  }
  if (chatGptResult != "undefined") {
    let newData = data[index];
    newData.guideRephrase = chatGptResult[0]?.message?.content
      ? chatGptResult[0]?.message?.content
      : "";
    var jsonContent = JSON.stringify(newData);
    fs.appendFileSync("OutPut.json", " , \n" + jsonContent);
  } else {
    let newData = data[index];
    newData.guideRephrase = "";
    var jsonContent = JSON.stringify(newData);
    fs.appendFileSync("OutPut.json", " , \n" + jsonContent);
  }
};

main();
