// Firebase references
const auth = firebase.auth();
const storage = firebase.storage();
const db = firebase.firestore();

// Sidebar Navigation
function showSection(sectionId){
  const sections = document.querySelectorAll('.section');
  sections.forEach(sec => sec.style.display='none');
  document.getElementById(sectionId).style.display='block';
}

// Login
function login(){
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById('loginDiv').style.display='none';
      document.getElementById('contentDiv').style.display='block';
      loadNotes();
    })
    .catch(err => alert(err.message));
}

function logout(){ auth.signOut().then(()=>location.reload()); }

// File Upload
function uploadFile(){
  const file = document.getElementById('fileInput').files[0];
  const storageRef = storage.ref(`notes/${file.name}`);
  const uploadTask = storageRef.put(file);

  uploadTask.on('state_changed', 
    null, 
    error => alert(error),
    () => {
      storageRef.getDownloadURL().then(url => {
        db.collection("notes").add({
          name: file.name,
          url: url,
          uploader: auth.currentUser.email,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => loadNotes());
      });
    }
  );
}

// Load Notes
function loadNotes(){
  const notesList = document.getElementById('notesList');
  notesList.innerHTML = '';
  db.collection("notes").orderBy("timestamp","desc").get().then(snapshot => {
    snapshot.forEach(doc => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${doc.data().url}" target="_blank">${doc.data().name}</a> <i>by ${doc.data().uploader}</i>`;
      notesList.appendChild(li);
    });
  });
}

// YouTube Search
const YT_API_KEY = "YOUR_YOUTUBE_API_KEY";
function searchYouTube(){
  const query = document.getElementById('ytSearch').value;
  fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${query}&key=${YT_API_KEY}`)
  .then(res=>res.json())
  .then(data=>{
    const ytResults = document.getElementById('ytResults');
    ytResults.innerHTML = '';
    data.items.forEach(item=>{
      const videoId = item.id.videoId;
      const title = item.snippet.title;
      const iframe = `<iframe width="300" height="200" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
      ytResults.innerHTML += `<div><h4>${title}</h4>${iframe}</div>`;
    });
  });
}

// AI Chat (OpenAI GPT Example)
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY";
async function askAI(){
  const input = document.getElementById('aiInput').value;
  const responseDiv = document.getElementById('aiResponse');
  responseDiv.innerHTML += `<p><b>You:</b> ${input}</p>`;
  
  const resp = await fetch("https://api.openai.com/v1/chat/completions",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages:[{role:"user", content:input}]
    })
  });
  
  const data = await resp.json();
  const answer = data.choices[0].message.content;
  responseDiv.innerHTML += `<p><b>AI:</b> ${answer}</p>`;
}
