// script.js

const API_KEY = "AIzaSyCrsW6iJmm_qoGlg58hO5d45au8Fcim5x8";

async function sendMessage(){

  const input = document.getElementById("input");

  const text = input.value;

  if(text === "") return;

  const chat = document.getElementById("chat");

  // mensagem usuário
  const userMessage = document.createElement("div");

  userMessage.classList.add("message");
  userMessage.classList.add("user");

  userMessage.innerText = text;

  chat.appendChild(userMessage);

  input.value = "";

  // mensagem carregando
  const loading = document.createElement("div");

  loading.classList.add("message");
  loading.classList.add("jarvis");

  loading.innerText = "Pensando...";

  chat.appendChild(loading);

  chat.scrollTop = chat.scrollHeight;

  try{

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({
          contents:[
            {
              parts:[
                {
                  text:text
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text
      || "Sem resposta.";

    loading.innerText = reply;

  }catch(error){

    loading.innerText = "Erro ao conectar.";

    console.log(error);

  }

}
