import axios from "axios";
import OpenAI from "openai";
import fs from "fs";
import data from "./final_data.json" assert { type: "json" };
const api = "https://peakato.com/api/v1";

const openai = new OpenAI({
  apiKey: "", // defaults to process.env["OPENAI_API_KEY"]
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
    await new Promise((resolve) => setTimeout(resolve, 22000));
  }
};

const main = async () => {
  handelLoopForAllData(data);
};

const chatGptMakeRequest = async (message) => {
  if (message?.guide.length >= 1) {
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
    return "undefined";
  }
};

const sendNewRecordToPeakato = async (chatGptResult, index) => {
  console.log("mine", chatGptResult);
  if (chatGptResult == undefined) {
    await new Promise((resolve) => setTimeout(resolve, 30000));
    fs.appendFileSync(
      "Output.txt",
      `${index + 1} : ${"limit rate reached"} \n`
    );
    return;
  }
  if (chatGptResult != "undefined") {
    fs.appendFileSync(
      "Output.txt",
      `${index + 1} : ${
        chatGptResult[0]?.message?.content
          ? chatGptResult[0]?.message?.content
          : "undefined"
      } \n`
    );
  } else {
    fs.appendFileSync("Output.txt", `${index + 1} : undefined \n`);
  }
};

main();
